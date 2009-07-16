/*
* Print Element Plugin 0.9
*
* Copyright (c) 2009 Erik Zaadi
*
* Inspired by PrintArea (http://plugins.jquery.com/project/PrintArea) and
* http://stackoverflow.com/questions/472951/how-do-i-print-an-iframe-from-javascript-in-safari-chrome
*
* $Id: jquery.printElement.js PENDING ID ErikZ $
*
* Dual licensed under the MIT and GPL licenses:
*   http://www.opensource.org/licenses/mit-license.php
*   http://www.gnu.org/licenses/gpl.html
*/
(function($) {
    $.fn.printElement = function(options) {
        var mainOptions = $.extend({}, $.fn.printElement.defaults, options);

        //Remove previously printed iframe if exists
        $("[id^='printElement_']").remove();

        return this.each(function() {
            //Support Metadata Plug-in if available
            var opts = $.meta ? $.extend({}, mainOptions, $this.data()) : mainOptions;
            _printElement($(this), opts);
        });
    };
    $.fn.printElement.defaults = {
        printMode: 'iframe', //Usage : iframe / popup
        pageTitle: '', //Print Page Title
        overrideElementCSS: [], //array of paths to alternate css files (optimized for print)
        printBodyOptions:
        {
            styleToAdd: 'padding:10px;margin:10px;', //style attributes to add to the body of print document
            classNameToAdd: '' //css class to add to the body of print document
        },
        leaveOpen: false, // in case of popup, leave the print page open or not
        iframeElementOptions:
        {
            styleToAdd: 'position:absolute;width:0px;height:0px;', //style attributes to add to the iframe element
            classNameToAdd: '' //css class to add to the iframe element
        }
    };
    function _printElement(element, opts) {
        var $elementToPrint = $(element);

        //Create markup to be printed
        var html = _getMarkup($elementToPrint, opts);

        var popupOrIframe = null;
        var documentToWriteTo = null;

        if (opts.printMode.toLowerCase() == 'popup') {
            popupOrIframe = window.open('', 'printElementWindow', 'width=650,height=440,scrollbars=yes');
            documentToWriteTo = popup.document;
        }
        else {
            var printElementID = "printElement_" + (Math.random() * 99999).toString();
            iframe = document.createElement('IFRAME');
            $(iframe).attr({ style: opts.iframeElementOptions.styleToAdd,
                id: printElementID,
                className: opts.iframeElementOptions.classNameToAdd
            });
            document.body.appendChild(iframe);
            documentToWriteTo = iframe.contentWindow.document;
            var iframe = document.frames ? document.frames[printElementID] : document.getElementById(printElementID);
            popupOrIframe = iframe.contentWindow || iframe;
        }
        documentToWriteTo.open();
        documentToWriteTo.write(html);
        documentToWriteTo.close();
        popupOrIframe.focus();
    };
    function _getMarkup(element, opts) {
        var $elementToPrint = $(element);
        var html = new Array();
        html.push('<html><head><title>' + opts.pageTitle + '</title>');

        if (opts.overrideElementCSS && opts.overrideElementCSS.length > 0) {
            for (var x = 0; x < opts.overrideElementCSS.length; x++) {
                html.push('<link type="text/css" rel="stylesheet" href="' + opts.overrideElementCSS[x] + '" >');
            }
        }
        else {
            $(document).find("link ")
                .filter(function() {
                    return $(this).attr("rel").toLowerCase() == "stylesheet";
                })
                .each(function() {
                    html.push('<link type="text/css" rel="stylesheet" href="' + $(this).attr("href") + '" >');
                });
        }
        html.push('</head><body onload="printPage();" style="' + opts.printBodyOptions.styleToAdd + '" class="' + opts.printBodyOptions.classNameToAdd + '">');
        html.push('<div class="' + $elementToPrint.attr("class") + '">' + $elementToPrint.html() + '</div>');
        html.push('<script type="text/javascript">function printPage() { focus();print();' + (opts.leaveOpen ? '' : 'close();') + '}</script></body></html>');

        return html.join('');
    };
})(jQuery);

