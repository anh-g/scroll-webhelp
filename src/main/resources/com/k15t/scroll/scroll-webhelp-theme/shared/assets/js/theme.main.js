/**
 *
 * K15t Help Theme
 * Main Javascript
 *
 **/

var searchURL = 'search.json';
var viewport = 'desktop';
var svdropdown = false;
//var pageId;

// firefox detection
var isFirefox = typeof InstallTrigger !== 'undefined';   // Firefox 1.0+

$(document).ready(function ($) {

    //pageId = $('body').attr('pageid');
    /* Set Type of Device */
    checkDevice();

    /* init Sidebar Functions */
    initDragbar();
    initSidebar();
    checkGrid();

    /* init Search Functions */
    initSearch();
    initButtons();
    initFooter();

    /* init Keyboard */
    initKeyboard();

    $('.sp-picker').change(function () {
        $(this).closest('form').trigger('submit');
    });

    $('#ht-error-search-button').bind('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        console.log($('#ht-search'));
        openSearch();
    });

    //setTimeout(function() {$('#ht-loader').hide();}, 500);
    $('#ht-loader').hide();
});

/*======================================
 =            Resize Sidebar            =
 ======================================*/

function initDragbar() {
    setDragbar(parseInt(getCookie('sidebar-width')));

    $('#ht-sidebar-dragbar').mousedown(function (e) {
        e.preventDefault();
        $(document).mousemove(function (e) {
            var mousex = e.pageX + 2;

            if (mousex < 190 || mousex > $(window).innerWidth() - 455)return;

            if (mousex < 220)$('#ht-sidebar').addClass('small');
            else $('#ht-sidebar').removeClass('small');


            setDragbar(mousex);
            setCookie('sidebar-width', mousex);

            checkGrid();

            $(document).mouseup(function (e) {
                $(document).unbind('mousemove');
            });
        });
    });

    setScrollVersionSelect();
}

function setDragbar(val) {
    // TODO chrome checken
    // evtl. width inline über viewport
    if (viewport != 'desktop')return;

    if (val == NaN)val = 295;

    $('#ht-sidebar').width(val);
    if (val < 220)$('#ht-sidebar').addClass('small');

    $('#ht-wrap-container').css("left", val + 10);
    $('#ht-headerbar').css('left', val);
}

function endDragbar() {
    if ($('#ht-sidebar').attr('style') == '')return;
    $('#ht-sidebar').attr('style', '');
    $('#ht-wrap-container').attr('style', '');
}

function setScrollVersionSelect(visible) {
    $.each($('.ht-scroll-versions-select select'), function (index, val) {
        setDropdown($(this));
    });
}


/*=========================================
 =            Toggle Sidebarnav            =
 =========================================*/

function initSidebar() {
    if (window.SCROLL && window.SCROLL.initPageTree) {
        window.SCROLL.initPageTree();
    }

    $('#ht-menu-toggle').bind('click', function (e) {
        e.preventDefault();
        setTimeout(toggleSidebar(), 0.05);
    });

    $('.ht-sidebar-cunfluence-toggle').bind('click', function (e) {
        e.preventDefault();
        var icon = $(this).find('i');

        if ($('.ht-sidebar-confluence-container').hasClass('open')) {
            $('.ht-sidebar-confluence-container').removeClass('open');
            icon.removeClass('sp-aui-iconfont-close-dialog').addClass('sp-aui-iconfont-arrow-up');
        } else {
            $('.ht-sidebar-confluence-container').addClass('open');
            icon.removeClass('sp-aui-iconfont-arrow-up').addClass('sp-aui-iconfont-close-dialog');
        }
    });
}

var tmpscroll;

function toggleSidebar() {
    if ($('html').hasClass('show-sidebar')) {
        $('.ht-content').css('margin-top', 'auto');
        $('html').removeClass('show-sidebar');
        $('body').scrollTop(tmpscroll);
        $('#ht-wrap-container, #ht-wrap-container *').unbind('click', toggleSidebar);
        $('.ht-sidebar-confluence-container').removeClass('open');
        $('.ht-sidebar-cunfluence-toggle i').removeClass('sp-aui-iconfont-close-dialog').addClass('sp-aui-iconfont-arrow-up');
    } else {
        tmpscroll = $('body').scrollTop();
        $('html').addClass('show-sidebar');
        $('.ht-content').css('margin-top', '-' + tmpscroll + 'px');
        $('#ht-wrap-container, #ht-wrap-container *').bind('click', toggleSidebar);
    }
}

/*=========================================
 =               Search                    =
 =========================================*/

function initSearch() {
    var input = $('#search input.search-input');
    input.on('focus', function (e) {
        stopKey = true;

        input.on('blur', function (e) {
            stopKey = false;
        });
    });


    input.on('input', function (e) {
        var str = input.val();
        console.log(str);
        if (str.length >= 3)doSearch(str);
        if (str.length == 0)$('.ht-search-dropdown').removeClass('open');
    });


}

function openSearch() {
    $('body').bind('click', function (e) {
        if (!$(e.target).parents('#ht-search').length && $('#ht-search').hasClass('open')) {
            $('body').unbind('click');
            closeSearch();
        }
    });
    $('#ht-search').addClass('open');
    setTimeout(function () {
        $('.ht-search-clear').addClass('show');
    }, 250);
    stopKey = true;
    $('.search-input')[0].focus();
}

function closeSearch() {
    input = $('#ht-search');
    input.find('input').val('');
    input.find('input').blur();
    input.removeClass('open');
    $('.ht-search-clear').removeClass('show');
    input.find('.ht-search-dropdown').removeClass('open');
}

function doSearch(str) {
    var search = $('.ht-search-input');
    var action = $('#search').attr('action');
    var query = "q=" + str;

    var version = $('#search #version');
    if (typeof version != 'undefined') {
        query = query + "&" + version.attr('name') + "=" + version.attr('value');

    }

    var variant = $('#search #variant');
    if (typeof variant != 'undefined') {
        query = query + "&" + variant.attr('name') + "=" + variant.attr('value');

    }

    var language = $('#search #language');
    if (typeof language != 'undefined') {
        query = query + "&" + language.attr('name') + "=" + language.attr('value');
    }

    var dropdown = search.find('.ht-search-dropdown');
    var key = search.find('.search-input').val();
    var count = 0;

    dropdown.find('ul').empty();

    dropdown.load(action + " #quick-search-results>ul", query + "&quicksearch=true", function () {
        $(document).unbind('keydown');
        $.each(dropdown.find('li'), function (index, val) {
            var item = $(this);
            item.attr('n', index);
            item.bind('mouseover', function () {

                dropdown.find('li a').removeClass('hover');
                $(this).find('a').addClass('hover');

            });
            dropdown.find('ul').append(item);
            count++;
        });

        var keybutton = $('<li class="search-key" n="' + count + '"><a class="search-key-button" href="' + action + '?' + query + '">Search: <b>' + key + '</b></a></li>');
        keybutton.bind('mouseover', function () {

            dropdown.find('li a').removeClass('hover');
            $(this).find('a').addClass('hover');

        });
        dropdown.find('ul').append(keybutton);

        $(document).bind('keydown', function (e) {
            switch (e.which) {

                case 13:
                    if ($('.ht-search-dropdown a.hover').length != 0) {
                        window.location.href = $('.ht-search-dropdown a.hover').attr('href');
                    } else {
                        window.location.href = $('#search').attr('action') + '?q=' + q;
                    }
                    break;

                case 38:
                    dropdownKeydown(-1, dropdown);
                    break;

                case 40:
                    dropdownKeydown(1, dropdown);
                    break;

                default:
                    return;
            }

            e.preventDefault();
        });

        dropdown.addClass('open');
    });
}

function dropdownKeydown(direction, dropdown) {
    var itemcount = dropdown.find('a').length;
    var currentitem = parseInt(dropdown.find('a.hover').parent().attr('n'));
    if (isNaN(currentitem))currentitem = -1;

    var nextitem = currentitem + direction;
    var dropdownHeight = dropdown.height() - 2;

    var itemheight = parseInt(dropdown.find('a.hover').outerHeight());

    if (nextitem < 0 || nextitem >= itemcount)return;

    $.each(dropdown.find('a'), function (index, val) {
        if (index == currentitem)$(this).removeClass('hover');
        if (index == nextitem) {
            $(this).addClass('hover');

            if ((itemheight * (index + 1)) - dropdown.scrollTop() > dropdownHeight) {
                dropdown.scrollTop((itemheight * (index + 1)) - dropdownHeight);
            } else if ((itemheight * (index + 1)) - dropdown.scrollTop() < itemheight && dropdown.scrollTop() > 0) {
                dropdown.scrollTop(itemheight * index);
            }
        }
    });
}


function initButtons() {

    $('#ht-search-button').bind('click', function (e) {
        e.preventDefault();
        openSearch();
    });

    $('.ht-search-clear').bind('click', function (e) {
        e.preventDefault();
        closeSearch();
    });
}


/*================================
 =            Dropdown            =
 ================================*/

function setDropdown(select) {
    var container = select.parent();
    var svg = '<svg width="10px" height="10px" viewBox="0 0 10 10" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g class="ht-select-button-icon"><path d="M2,3 L8,3 L5,7 L2,3 Z"></path></g></svg>';
    var toggle = $('<a class="ht-select-button" href="#"><span>' + select.find('option:selected').text() + '</span>' + svg + '</a>')
    container.append(toggle);

    var label = container.parent().find('label').remove();
    toggle.prepend(label);

    var dropdown = $('<div class="ht-dropdown ht-dropdown-select"><ul></ul></div>');
    container.append(dropdown);

    $.each(select.find('option'), function (index, val) {
        var item = $('<li n="' + index + '"><a href="#" data-scroll-integration-name="' + select.attr('name') + '" data-scroll-integration-value="' + $(this).attr('value') + '">' + $(this).text() + '</a></li>');
        dropdown.append(item);
    });

    select.on('change', function () {
        var val = select.val();
        toggle.find('span').text(select.find('option:selected').text());
    });

    toggle.bind('click', function (e) {
        e.preventDefault();

        if (viewport == 'mobile' && !isFirefox) {
            openSelect(select);
            return;
        }

        $.each($('.' + container.attr('class')), function (index, val) {
            if ($(this).find('.ht-select-button').hasClass('active'))toogleDropdown($(this), false);
        });

        if ($(this).hasClass('active')) {
            toogleDropdown(container, false);
            $(this).removeClass('active');
        } else {
            toogleDropdown(container, true);
            $(this).addClass('active');
        }
    });
}

function toogleDropdown(container, open) {
    if (open) {
        $('body').bind('click', function (e) {
            e.preventDefault();
            if ($(e.target).is(container.find('*')))return;
            toogleDropdown(container, !open);
        });

    } else {
        $('body').unbind('click');
    }

    var toggle = container.find('.ht-select-button');
    var dropdown = container.find('.ht-dropdown');

    if (open) {

        toggle.addClass('active');
        dropdown.addClass('open');

        $.each(dropdown.find('li'), function (index, val) {
            $(this).bind('mouseover', function () {
                dropdown.find('li a').removeClass('hover');
                $(this).find('a').addClass('hover');
            });
            $(this).find('a').bind('click', function (e) {
                e.preventDefault();

                var name = $(e.target).attr('data-scroll-integration-name');
                var value = $(e.target).attr('data-scroll-integration-value');

                $('select[name="' + name + '"]').find('option:selected').attr('selected', false);
                $('select[name="' + name + '"]').find('option[value="' + value + '"]').attr('selected', true);

                $('select[name="' + name + '"]').trigger('change');

            });
        });

    } else {
        toggle.removeClass('active');
        dropdown.removeClass('open');

    }
}

/*===================================
 =            Init Footer            =
 ===================================*/
function initFooter() {
    checkFooter();

    $('#ht-jump-top').bind('click', function (e) {
        e.preventDefault();
        $('body,html').animate({
                scrollTop: 0},
            250);
    });
}

function checkFooter() {
    if ($('article.ht-content').outerHeight() < $(window).innerHeight()) {
        $('#ht-jump-top').fadeOut();
    } else {
        $('#ht-jump-top').fadeIn();
    }
}


/*=============================================
 =            Media Query Detection            =
 =============================================*/
function checkDevice() {
    var i = parseInt($('#ht-mq-detect').css('width').replace('px', ''));

    switch (i) {
        case 1:
            viewport = 'mobile';
            break;

        case 2:
            viewport = 'tablet';
            break;

        case 3:
            viewport = 'tablet';
            break;

        case 4:
            viewport = 'desktop';
            break;

        case 5:
            viewport = 'desktop';
            break;
    }

    if (viewport != 'desktop')endDragbar();
    else {
        setDragbar(parseInt(getCookie('sidebar-width')));
        $('html').removeClass('show-sidebar');
    }
}


/*=====================================
 =            Window Resize            =
 =====================================*/
var rtime = new Date(1, 1, 2000, 12, 00, 00);
var timeout = false;
var delta = 200;
$(window).resize(function () {
    rtime = new Date();
    if (timeout === false) {
        timeout = true;
        setTimeout(resizeend, delta);
    }
});

function resizeend() {
    if (new Date() - rtime < delta) {
        setTimeout(resizeend, delta);
    } else {
        timeout = false;
        checkFooter();
        checkDevice();
        checkGrid();
    }
}

function openSelect(selector) {
    var element = $(selector)[0], worked = false;

    if (document.createEvent) { // all browsers
        var e = document.createEvent("MouseEvents");
        e.initMouseEvent("mousedown", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        worked = element.dispatchEvent(e);

    } else if (element.fireEvent) { // ie
        worked = element.fireEvent("onmousedown");
    }
    if (!worked) { // unknown browser / error

    }
}


/*=====================================
 =             Keyboard              =
 =====================================*/
var stopKey, lastKey;

function initKeyboard() {
    stopKey = false;

    $('body').bind('keyup', function (e) {
        //if(e.which != 18 && e.which != 16)alert(e.which);
        if (stopKey && e.which != 27)return;

        switch (e.which) {
            case 219: //[
                openSearch();
                break;

            case 191: // /
                stopKey = true;

                break;

            case 71: // g
                if (lastKey == 71) {
                    openSearch();
                }
                break;

            case 27: // esc
                closeSearch();
                break;
        }

        lastKey = e.which;
    });
}


/*=====================================
 =              Cookies               =
 =====================================*/

function setCookie(cname, cvalue) {
    var d = new Date();
    d.setTime(d.getTime() + (24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires + "; path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
}

/*=====================================
 =               GRID                 =
 =====================================*/

function checkGrid() {
    if ($('#ht-wrap-container').width() > 1024) {
        $('#ht-wrap-container').addClass('sp-grid-float');
        $('#ht-wrap-container').removeClass('sp-grid-fluid');
    } else {
        $('#ht-wrap-container').addClass('sp-grid-fluid');
        $('#ht-wrap-container').removeClass('sp-grid-float');
    }
}