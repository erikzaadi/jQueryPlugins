/*
* jQuery Late Loader
*
* Copyright (c) 2009 Erik Zaadi
*
* Plugin home page : http://plugins.jquery.com/project/TODO! 
* Wiki : http://wiki.github.com/erikzaadi/jQueryPlugins/jquerylateloader
* 
* Dual licensed under the MIT and GPL licenses:
*   http://www.opensource.org/licenses/mit-license.php
*   http://www.gnu.org/licenses/gpl.html
*/
; (function($) {
    $.LateLoader = {
        LoadScriptOrCSS: _LoadScriptOrCSS,
        /*
        Loads a javascript/css from the passed url if it wasn't previously loaded
         
        The parameter can either be a string with the wanted url( then the default
        params are used (See Defaults for more details)), or an option object 
        URL -> relative or absolute URL to your javascript/css 
        */
        IsScriptOrCSSLoaded: _IsScriptOrCSSLoaded,
        /*
        Returns true|false if a javascript/css is already loaded (via LoadScriptOrCSS)
        
        Parameters : 
        URL-> relative or absolute URL to your javascript/css 
        Type->'js' or 'css' (defaults to 'js')
        */
        GetLoadedScriptOrCSSs: _GetScriptOrCSSArray,
        /*
        Returns an array of all loaded scripts (object with 2 arrays, css and js)
        */
        GetLoadedScriptOrCSSsByType: _GetScriptOrCSSArrayByType,
        /*
        Returns an array of all loaded scripts/css according to the passed type
        
        Parameter : 
        Type->'js' or 'css' 
        */
        PluginDefaults:
        {
            ArrayDataKey: "LateLoaderDataKey", //Unique key used to identify the jQuery Data collection
            ElementToAttachDataTo: "body", //DOM object that hosts the jQuery Data collection
            RemoteTimeout: 1500 //MS of timeout to wait for a remote script..
        },
        Defaults:
            {
                URL: null, //Will be filled in by LoadScriptOrCSS's parameter
                Type: 'js', // 'js' or 'css' (defaults to 'js')
                LoadedCallBackFunction: null, // Called when the javascript/css is loaded (default is null)
                ErrorCallBackFunction: null// Called when an error occurs (default is null)
            }

    };

    //Public method implementation
    function _LoadScriptOrCSS(OptionsOrURL) {
        var options;
        if (typeof (OptionsOrURL) == 'string') {
            options = $.extend({}, $.LateLoader.Defaults, { URL: OptionsOrURL });
        } else {
            options = $.extend({}, $.LateLoader.Defaults, OptionsOrURL);
        }
        if (_IsScriptOrCSSLoaded(options.URL, options.Type)) {
            _CallFunctionIfAvailable(options.LoadedCallBackFunction, options.URL);
            return;
        }

        if (options.Type == 'js') {
            if (_URLIsRemote(options.URL)) {
                //The error will not be thrown, we'll have to check this according to a certain timeout..
                setTimeout(function() {
                    if (!_IsScriptOrCSSLoaded(options.URL, options.Type))
                        _Error(options);
                }, $.LateLoader.PluginDefaults.RemoteTimeout);
            }
            $.ajax({
                dataType: 'script',
                url: options.URL,
                success: function() {
                    _Success(options);
                },
                error: function() {
                    _Error(options);
                },
                data: {}
            });
        }
        else {
            _AddCSSFile(options);
        }
    }

    function _IsScriptOrCSSLoaded(URL, Type) {
        var ScriptOrCSSArray = _GetScriptOrCSSArray() || {};
        return (ScriptOrCSSArray[Type] && ($.inArray(URL, ScriptOrCSSArray[Type]) != -1)) ? true : false;
    }

    function _GetScriptOrCSSArray() {
        var ScriptOrCSSData = $($.LateLoader.PluginDefaults.ElementToAttachDataTo).data($.LateLoader.PluginDefaults.ArrayDataKey);
        var ScriptOrCSSArray = ScriptOrCSSData && ScriptOrCSSData['ScriptOrCSSs'] ? ScriptOrCSSData.ScriptOrCSSs : false;
        if (!ScriptOrCSSArray)
            return false;
        else
            return ScriptOrCSSArray;
    }

    function _GetScriptOrCSSArrayByType(Type) {
        var ScriptOrCSSArray = _GetScriptOrCSSArray() || false;
        if (!ScriptOrCSSArray)
            return false;
        if (!ScriptOrCSSArray[Type])
            return false;
        return ScriptOrCSSArray[Type];
    }

    //Private helpers
    function _Error(options) {
        _CallFunctionIfAvailable(options.ErrorCallBackFunction, 'error loading ' + options.Type + ' - ' + options.URL);
    }
    function _Success(options) {
        _AddLoadedScriptOrCSSToArray(options);
        _CallFunctionIfAvailable(options.LoadedCallBackFunction, options.URL);
    }

    function _ValidateCSSFileLoaded(options) {
        var $createdLink = $("link[href='" + options.URL + "']");

        var success = true;

        if (!$createdLink.length) {
            success = false;
        }
        if ($createdLink.get(0).readyState) {
			var created = $createdLink.get(0).readyState;
            success = created == "complete" || created == "loaded";
        } else {
            if (false /*Need to find a non IE solution to validate if the external stylesheet has loaded*/) {
                success = false;
            }
        }

        if (success) {
            _Success(options);
        }
        else {
            _Error(options);
        }
    }

    function _AddCSSFile(options) {
        if (!_URLIsRemote(options.URL)) {
            $.ajax({
                url: options.URL,
                dataType: "text",
                success: function(data) {
                    var randID = Math.round(Math.random() * 321312);
                    var $link = $("<style />")
                    .attr({ "rel": "stylesheet", "type": "text/css", "id": randID.toString() });
                    $link.appendTo("head");
                    setTimeout(function() {
                        var created = $("#" + randID.toString());
                        if ($.browser.msie)
                            created.get(0).styleSheet.cssText = data;
                        else
                            created.text(data);
                        _Success(options);
                    }, 15);
                },
                error: function() { _Error(options); },
                data: {}
            });
        }
        else {
            $("<link />")
            .ready(function() { setTimeout(function() { _ValidateCSSFileLoaded(options); }, 15); })
            .attr({ "rel": "stylesheet", "type": "text/css", "href": options.URL })
            .appendTo("head");
        }
    }

    function _AddLoadedScriptOrCSSToArray(options) {
        var ScriptOrCSSArray = _GetScriptOrCSSArray() || {};
        if (!ScriptOrCSSArray[options.Type])
            ScriptOrCSSArray[options.Type] = new Array();
        ScriptOrCSSArray[options.Type].push(options.URL);
        $($.LateLoader.PluginDefaults.ElementToAttachDataTo).data($.LateLoader.PluginDefaults.ArrayDataKey, { ScriptOrCSSs: ScriptOrCSSArray });
    }
    function _CallFunctionIfAvailable(method, param) {
        if (method && $.isFunction(method))
            method(param);
    }

    function _URLIsRemote(url) {
        return url.indexOf("http") > -1 &&
        (url.indexOf("http://" + window.location.host) == -1 && url.indexOf("https://" + window.location.host) == -1);
    }

})(jQuery);