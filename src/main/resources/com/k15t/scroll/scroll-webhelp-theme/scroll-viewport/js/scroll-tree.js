(function() {
    window.SCROLL = window.SCROLL || {};

    SCROLL.initPageTree = function(successCallback) {
        $('.ht-pages-nav-top').scrollTree({
            'contextPath': AJS.contextPath(),
            'css': {
                'ancestor': 'active',
                'current': 'active',
                "leaf": 'leaf',
                'loading': 'sp-loading',
                'collapsed': 'collapsed',
                'expanded': 'open',
                'error': 'sp-error'
            },
            'renderChildrenUl': function () {
                return '<ul class="nav ht-pages-nav-sub"></ul>';
            },
            'renderChildLi': function (child, opts) {
                var aclass = (window.location.pathname == child.link) ? 'current' : '';

                var node = '<li class="' + opts.css[child.type] + '"><a class="ht-nav-page-link ' + aclass + '" href="' + child.link + '">' + child.title + '</a>';
                if (child.children) {
                    node += '<span class="sp-toggle sp-aui-icon-small ht-pages-nav-toggle">' +
                        '<svg id="icon-minus" width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg">' +
                        '    <g fill="#CCCCCC">' +
                        '        <rect x="7" y="11" width="10" height="2"></rect>' +
                        '    </g>' +
                        '</svg>' +
                        '<svg id="icon-plus" width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg">' +
                        '    <g fill="#CCCCCC">' +
                        '        <rect x="11" y="7" width="2" height="10"></rect>' +
                        '        <rect x="7" y="11" width="10" height="2"></rect>' +
                        '    </g>' +
                        '</svg>' +
                        '</span>';
                }
                node += '</li>';

                return node;
            }
        }).done(function() {
            successCallback();
        });
    };

}());
