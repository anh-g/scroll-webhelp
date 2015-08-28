(function() {
    'use strict';

    window.SCROLL_WEBHELP = window.SCROLL_WEBHELP || {};
    window.SCROLL_WEBHELP.search = window.SCROLL_WEBHELP.search || {};


    var workerIsActive = false;
    var worker;
    var idx;

    var queryCallbacks = {};


    window.SCROLL_WEBHELP.search.performSearch = function(query, onResultsAvailableCallback) {
        search(query, onResultsAvailableCallback);
    };


    var search = function(query, onResultsAvailableCallback) {
        if (typeof idx !== 'undefined'){
            onResultsAvailableCallback(searchInMainThread(query), query);
        } else if(workerIsActive) {
            searchWithWorker(query, onResultsAvailableCallback);
        }
    };


    var searchInMainThread = function(query) {
        var results = idx.search(query).map(function(result) {
            return lunrData.filter(function (d) {
                return d.id === parseInt(result.ref, 10)
            })[0];
        });

        return processSearchResults(results, query);
    };


    var searchWithWorker = function(query, callback) {
        var queryId = new Date().getTime();
        queryCallbacks[queryId] = callback;
        worker.postMessage({type: 'search-request', query: query, queryId: queryId});
    };


    var processSearchResults = function(results, query) {
        $.each(results, function(idx, result) {
            result.link = result.link + '?q=' + query;
        });
        return results;
    };


    window.SCROLL_WEBHELP.search.navigateToSearchPage = function(query) {
        search(query, displaySearchResultsPage);
    };


    var displaySearchResultsPage = function(searchResults, query) {
        var container = $('#html-search-results');

        container.find('.ht-content-header h1').html('Search for <em>"' + escapeHtml(query) + '"</em> returned ' + searchResults.length
            + ' result' + (searchResults.length != 1 ? 's.' : '.'));

        var list = $("#search-results");
        list.empty();

        var baseUrl = window.location.href.substr(0, window.location.href.lastIndexOf('/') + 1);

        $.each(searchResults, function(index, searchResult) {
            var displayUrl = baseUrl + searchResult.link.substr(0, searchResult.link.lastIndexOf('?'));
            list.append('<section class="search-result">'
                +'<header><h2><a href="' + searchResult.link + '">' + searchResult.title + '</a></h2></header>'
                +'<div class="search-result-content"><p class="search-result-link">' + displayUrl + '</p></div>'
                +'<hr>'
                +'</section>');
        });

        $('#ht-content, #ht-post-nav').hide();
        container.show();
    };


    var searchSetup = function() {
        var locationOrigin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
        var pageLocation = locationOrigin + window.location.pathname;
        var url = pageLocation.substr(0, pageLocation.lastIndexOf('/') + 1);

        var onIndexLoaded = function() {
            $('.ht-search-index-loader').fadeOut(300, function() {
                $('.ht-search-input').fadeIn();
            });
        };

        try {
            // Creates the Web Worker, to overcome the Same-Origin policy the URL is passed to the worker.
            var blob = new Blob([document.querySelector('#worker').textContent]);
            worker = new Worker(window.URL.createObjectURL(blob));

            worker.onmessage = function (event) {
                var message = event.data;

                if (message.type === 'setup-complete') {
                    onIndexLoaded();
                    workerIsActive = true;
                }

                if (message.type === 'search-results') {
                    var callback = queryCallbacks[message.queryId];
                    if (callback) {
                        delete queryCallbacks[message.queryId];
                        callback(processSearchResults(message.results, message.query), message.query);
                    }
                }
            };

            // what the worker does in case of an error
            worker.onerror = function(error) {
                console.log("Worker error: " + error.message + "\n");
                error.preventDefault();
                throw(error);
            };

            // send page url to the worker, for script loading
            worker.postMessage({type: "setup", baseUrl: url});

        } catch (error) {
            setTimeout(function () {
                if(!workerIsActive){
                    $.ajax({
                        url:'js/lunr-data.js',
                        cache:true,
                        crossDomain: true,
                        dataType: 'script'
                    });

                    $.ajax({
                        url:'js/lunr-index.js',
                        cache:true,
                        crossDomain: true,
                        dataType:'script'
                    }).done(function() {
                            idx = lunr.Index.load(lunrIndex);
                            idx.pipeline.remove(lunr.stopWordFilter);
                            onIndexLoaded();
                        }
                    );
                }
            }, 3000);
        }
    };


    var entityMap = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': '&quot;',
        "'": '&#39;',
        "/": '&#x2F;'
    };


    function escapeHtml(string) {
        return String(string).replace(/[&<>"'\/]/g, function (s) {
            return entityMap[s];
        });
    }


    var getQueryVariable =  function(variable) {
        var query = window.location.search.substring(1);
        var vars = query.split("&");
        for (var i=0;i<vars.length;i++) {
            var pair = vars[i].split("=");
            if(pair[0] == variable){return pair[1];}
        }
        return(false);
    };


    var highlightSetup = function() {
        var htmlSearchQuery = getQueryVariable('q');

        if (htmlSearchQuery != false) {
            var flag = $('#sp-remove-search-flags');
            flag.bind('click', function(e) {
                $('#ht-wrap-container').unhighlight({className: 'search-highlight'});
                flag.hide();
                e.preventDefault();
            });
            flag.show();

            var decodedQuery = decodeURI(htmlSearchQuery);
            $('#ht-wrap-container').highlight(decodedQuery, {className: 'search-highlight'});
        }
    };


    $(document).ready(function () {
        searchSetup();
        highlightSetup();
    });

}());