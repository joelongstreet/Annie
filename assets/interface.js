$(function(){

    // Build templates and retrieve local storage values
    // for each mapped key
    (function(){
        var binaryIterator = 0;

        for(var key in mapper){
            var helpText    = '' || mapper[key].help;
            var labelText   = '' || mapper[key].label;
            var helpKlass   = helpText ? '' : 'hidden';
            var storedVal   = localStorage.getItem(key);
            var defaultVal  = (storedVal == 'true') ? 'checked' : ''

            var template    = '' +
                '<li>' +
                    '<label>' +
                        '<input type="checkbox" name="' + key + '" ' + defaultVal + ' /> ' +
                        labelText +
                    '</label>' +
                    '<p class="help ' + helpKlass + '">' + helpText + '</p>'
                '</li>';

            $($('#input-lists').find('ul')[binaryIterator]).append(template);
            binaryIterator = (binaryIterator == 0) ? 1 : 0
        }
    })();


    // Listen for change functions, save to local storage
    $('input:checkbox').change(function(){
        var inputName = $(this).attr('name');
        if($(this).is(':checked')){
            localStorage.setItem(inputName, true);
        } else localStorage.setItem(inputName, false);
    });


    // Collect filter types and call the rest fetcher
    $('.build-csv').click(function(){
        $('.interface').fadeOut(function(){
            $('.loading').fadeIn();
        });

        var selectedFields = [];
        $('input:checkbox').each(function(){
            if($(this).is(':checked')){
                var inputName = $(this).attr('name');
                selectedFields.push(inputName);
            }
        });

        sendMessageToBackground(selectedFields);
    });


    // Builds a little custom greeting just for fun
    (function(){
        var hours   = new Date().getHours();
        var greeting = '';
        if(hours < 11) greeting = 'Good Morning'
        else if(hours < 16) greeting = 'Good Afternoon'
        else greeting = 'Good Evening'

        $('#greeting').text(greeting);
    })();


    // Select and deselect all inputs checkboxes
    $('.check-all').find('a').click(function(){
        var val = $(this).hasClass('select-all');
        $('input[type="checkbox"]').each(function(){
            $(this).prop('checked', val);
            localStorage.setItem($(this).attr('name'), val);
        })
    });


    // Close the extension
    $('.close').click(function(){
        window.close();
    });
});


var sendMessageToBackground = function(selectedFields){
    chrome.extension.sendMessage({ settings : selectedFields },function(response){
        if(!response.error){
            $('.loading').fadeOut(function(){
                var encoded     = encodeURIComponent(response.csv);
                var fileContent = 'data:text/csv;charset=utf-8,' + encoded;
                $('.download').fadeIn();
                $('#downloadCSV').attr('href', fileContent).attr('download', 'user-data.csv');
            });
        } else{
            $('.loading').fadeOut(function(){
                $('.error-handler').fadeIn();
            })
        }
    });
};