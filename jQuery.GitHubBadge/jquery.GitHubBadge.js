/*
*  jQuery GitHub Badge 1.0
*
*  Copyright (c) 2009 Erik Zaadi
*
*  Inspired by http://drnicjavascript.rubyforge.org/github_badge and
*   http://mattn.github.com/jquery-github-badge/
*
*  Home Page : http://erikzaadi.github.com/jQueryPlugins/jQueryGitHubBadge
*  jQuery Plugin home page : http://plugins.jquery.com/project/GitHubBadge
*  Wiki : http://wiki.github.com/erikzaadi/jQueryPlugins/jQueryGitHubBadge
* 
* Dual licensed under the MIT and GPL licenses:
*   http://www.opensource.org/licenses/mit-license.php
*   http://www.gnu.org/licenses/gpl.html
*/
; (function($) {
    $.fn.GitHubBadge = function(options) {
        if (typeof (options) == 'string')
            options = { user: options };
        var mainOptions = $.extend({}, $.fn.GitHubBadge.defaults, options);
        return this.each(function() {
            //Support Metadata Plug-in if available
            var opts = $.meta ? $.extend({}, mainOptions, $this.data()) : mainOptions;
            _GitHubBadge($(this), opts);
        });
    };
    $.fn.GitHubBadge.defaults = // Default options, can either be object, or simply the user name as string
	{
	    user: '', // Mandatory (Duh!)
	    showErrors: false, //Display error messages
	    showForks: true, //Shows not only personal public repositories, but forks as well
	    validateUser: false //Validates that user exists (404 can not be detecteted, due to JSONP..), NOTE: Generates an extra request
    };
    /*
        CSS Classes used:
        GithubBadge -> Main container
        GithubBadgeTitle
        GithubBadgeRepo
        GithubBadgeFork
        GithubBadgeError
    */
    function _GitHubBadge($gitHubBadgeElement, options) {
        if (options.validateUser) {
            _GitHubBadgeValidateUser($gitHubBadgeElement, options);
        }
        else {
            _getGitHubBadge($gitHubBadgeElement, options);
        }
    }

    function _GitHubBadgeValidateUser($gitHubBadgeElement, options) {
        $.ajax({
            url: 'http://github.com/api/v2/json/user/search/' + options.user,
            data: {},
            success: function(data) {
                if (data && data.users && data.users.length > 0)
                    _getGitHubBadge($gitHubBadgeElement, options);
                else _GitHubBadgeError($gitHubBadgeElement, options);
            },
            dataType: 'jsonp',
            error: function(XMLHttpRequest, textStatus, errorThrown) {
                if (console && console.log) {
                    console.log('Error occured while getting the GitHub repositories for : "' + options.user + '"');
                    console.log(XMLHttpRequest);
                    console.log(textStatus);
                    console.log(errorThrown);
                }
                _GitHubBadgeError($gitHubBadgeElement, options);
            }
        });
    }

    function _GitHubBadgeError($gitHubBadgeElement, options) {
        if (options.showErrors) {
            $gitHubBadgeElement.html('<div class="GitHubBadgeError">Error occured while getting the GitHub repositories for : <strong>"' + options.user + '"</strong></div>');
        }
    }

    function _getGitHubBadge($gitHubBadgeElement, options) {
        $.ajax({
            url: 'http://github.com/api/v2/json/repos/show/' + options.user,
            data: {},
            success: function(data) {
                var forks = new Array();
                var html = new Array();
                var repositories = data.repositories;
                html.push('<span class="GithubBadge"><div class="GithubBadgeTitle"><a href="http://github.com/' + options.user + '" target="_blank">My Github Homepage</a></div>');
                if (repositories.length > 1) {
                    html.push('<div class="GithubBadgeTitle">My Repositories</div>');
                    for (var repo in repositories) {
                        var current = repositories[repo];
                        //there's one function object that doesn't have the description
                        if (typeof (current.description) == 'undefined')
                            continue;
                        //separate forks 
                        if (current.fork) {
                            forks.push(current);
                            continue;
                        }
                        //Don't show Github Pages Projects
                        if ($.trim(current.name.toString().toLowerCase()) == options.user.toString().toLowerCase() + '.github.com') {
                            continue;
                        }
                        html.push('<div class="GithubBadgeRepo"><a title="' + current.description + '" href="' + current.url + '" target="_blank">' + current.name + '</a></div>');
                    }
                    if (options.showForks && forks.length > 0) {
                        html.push('<div class="GithubBadgeTitle">Forked Repositories</div>');
                        for (var forkRep in forks) {
                            var currentFork = forks[forkRep];
                            //IE Bug :(
                            if (typeof (currentFork.description) == 'undefined')
                                continue;
                            html.push('<div class="GithubBadgeRepo GithubBadgeFork"><a title="' + currentFork.description + '" href="' + currentFork.url + '" target="_blank">' + currentFork.name + '</a></div>');
                        }
                    }
                }
                else {
                    html.push('<div class="GithubBadgeTitle">No repositories found..</div>');
                }
                html.push('</span>');
                $gitHubBadgeElement.fadeOut('slow', function() { $(this).html(html.join('')).fadeIn('slow'); });
            },
            dataType: 'jsonp',
            error: function(XMLHttpRequest, textStatus, errorThrown) {
                if (console && console.log) {
                    console.log('Error occured while getting the GitHub repositories for : "' + options.user + '"');
                    console.log(XMLHttpRequest);
                    console.log(textStatus);
                    console.log(errorThrown);
                }
                _GitHubBadgeError($gitHubBadgeElement, options);
            }
        });
    }
})(jQuery);