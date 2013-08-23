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
                    '<label for="' + key + '">' +
                        '<input type="checkbox" name="' + key + '" ' + defaultVal + ' /> ' +
                        labelText +
                    '</label>' +
                    '<p class="help ' + helpKlass + '">' + helpText + '</p>'
                '</li>';

            $($('#input-lists').find('ul')[binaryIterator]).append(template);
            binaryIterator = (binaryIterator == 0) ? 1 : 0
        }
    })();

    $('input:checkbox').change(function(){
        var inputName = $(this).attr('name');
        if($(this).is(':checked')){
            localStorage.setItem(inputName, true);
        } else localStorage.setItem(inputName, false);
    });
});