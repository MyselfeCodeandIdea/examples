$(document).ready(function () {
    var baseUrl = location.href.split('?')[0],
        params = location.search.substr(1).split('&'),
        select = document.getElementById('version'),
        themeSelect = document.getElementById('theme'),
        editor;

    // convert params to object
    params = params.reduce(function (obj, val) {
        val = val.split('=');

        obj[val[0]] = decodeURIComponent(val[1]);

        return obj;
    }, {});

    document.title = 'pixi.js - ' + params.title;

    $.getJSON('https://api.github.com/repos/GoodBoyDigital/pixi.js/git/refs/tags')
        .done(function (data)
        {
            // filters the tags to only include v3 and above
            data = data
                .filter(function (tag) {
                    return tag.ref.indexOf('refs/tags/v3') === 0;
                })
                .map(function (tag) {
                    return tag.ref.replace('refs/tags/', '');
                });


            // populates the dropdrown section with the pixi tags
            for (var i = 0; i < data.length; i++) {
                var option = document.createElement('option');

                option.value = 'https://cdn.rawgit.com/GoodBoyDigital/pixi.js/' + data[i] + '/bin/pixi.js';
                option.textContent = data[i];
                option.dataset.version = data[i];
                select.appendChild(option);
            }

            //  if a specific version was required
            if (params.v) {
                for (var i = 0; i < select.options.length; ++i) {
                    if (select.options[i].dataset.version === params.v) {
                        select.selectedIndex = i;
                        break;
                    }
                }
            } else {
                select.selectedIndex = 1;
            }

            select.addEventListener('change', function () {
                params.v = select.options[select.selectedIndex].dataset.version;

                location.href = baseUrl + '?' + $.param(params);
            });


        });

    if (params.v) {
        var url = 'https://cdn.rawgit.com/GoodBoyDigital/pixi.js/' + params.v + '/bin/pixi.js';
        loadPixi(url);
    }
    else{
        loadPixi('_site/js/pixi.js');
    }


    function loadPixi(url)
    {
        // get the pixi lib
        loadScript(url, 'lib-script',onPixiLoaded);

        function onPixiLoaded()
        {
            loadExample('examples/' + params.s + '/' + params.f);
        }
    }

    function loadExample(url)
    {
        // load the example code and executes it
        loadScript(url, 'example-script');

        // load the example code
        $.ajax({ url: url, dataType: 'text' })
            .done(function (data)
            {
                exampleCodeLoaded(url, data);
            });
    }

    function exampleCodeLoaded (url, code)
    {
        var textarea = document.getElementById('sourcecode');

        var title = document.querySelector('h1');

        title.innerHTML = params.title;

        textarea.innerHTML = code;

        var editorOptions = {
            mode: 'javascript',
            lineNumbers: true,
            styleActiveLine: true,
            matchBrackets: true
        };

        editor = CodeMirror.fromTextArea(textarea,editorOptions);

        themeSelect.addEventListener('change',changeTheme,false);

        function changeTheme()
        {
            var theme = themeSelect.options[themeSelect.selectedIndex].innerHTML;
            editor.setOption('theme', theme);
        }
    }

    function loadScript(url, id, cb) {
        var script = document.getElementById(id) || document.createElement('script');

        if (script.parent) {
            script.remove();
        }

        script.setAttribute('src', url);

        if (cb)
        {
            script.addEventListener('load',loadHandler);

             function loadHandler()
             {
                script.removeEventListener('load', loadHandler);

                cb();
            }
        }

        document.body.appendChild(script);
    }
});