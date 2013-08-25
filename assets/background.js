var baseURL     = 'http://passport.vml.com/rest/';
var fetchURL    = '';
var dateProps   = ['access', 'created', 'login', 'field_birthday', 'field_anniversary', 'field_updated'];

// Show the icon if the user is on a passport page
// Set fetchURL when the URL changes
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
    var onPageTruthTest = 0;
    if(tab.url.indexOf('passport.vml.com') != -1) onPageTruthTest++;
    if(tab.url.indexOf('/user/') != -1) onPageTruthTest++;
    if(tab.url.indexOf('/users') != -1) onPageTruthTest++;

    if(onPageTruthTest > 1) {
        chrome.pageAction.show(tabId);

        var usersURL = baseURL + 'search/user_index/ui.json?limit=5000';
        if(tab.url.indexOf('/users?') != -1){
            fetchURL = usersURL + '&' + tab.url.split('?')[1];
        } else if(tab.url.indexOf('/user/') != -1){
            var splits      = tab.url.split('/');
            var username    = splits[splits.length - 1];
            fetchURL        = baseURL + 'user/' + username + '/ui.json';
        } else fetchURL = usersURL
    }
});


// Wait for a message from the background script
chrome.extension.onMessage.addListener(function(message, sender, sendResponse){
    $.ajax({
        url     : fetchURL,
        success : function(data, msg, jqXHR){
            var users   = parseUserData(data, message.settings);
            var csvBody = createCSV(users, message.settings); 
            sendResponse({ csv : csvBody });
        }, error : function(jqXHR, message, exception){
            sendResponse({ error : message });
        }
    });

    return true
});


// This will do it's best job of flattening deep objects 
// for this particular kind of response.
var flatten = function(data){
    if(!data) return '';
    if(typeof(data) == 'string') return data
    if(typeof(data == 'object')){
        // If we're working with an array
        if(data.length){
            var stringedArray = '';
            for(var i=0; i<data.length; i++){
                stringedArray += data[i].label
            }
            return stringedArray
        } 
        // If it's an object
        else{
            if(data.label) return data.label
            if(data.urls) return data.urls['default']
            var keys = Object.keys(data);
            return data[keys[0]]
        }
    }
};


var parseUserData = function(data, settings){
    var users   = [];
    var results = data.results || [data];

    for(var i=0; i<results.length; i++){
        var user = {};
        for(var key in results[i]){
            if(settings.indexOf(key) != -1){
                user[key] = flatten(results[i][key]);
            }
        }
        users.push(fixDates(user));
    }

    return users;
};


var fixDates = function(flatObject){
    for(var i=0; i<dateProps.length; i++){
        if(flatObject[dateProps[i]]){
            flatObject[dateProps[i]] = moment(flatObject[dateProps[i]]*1000).format('MM/DD/YY');
        }
    }

    return flatObject;
};


var createCSV = function(arrayOfFlatObjects, settings){
    var headers     = '';
    var rows        = '';

    for(var i = 0; i<settings.length; i++){
        headers += settings[i];
        if(i != settings.length - 1) headers += ', '
        else headers += '\n'
    }

    for(var i=0; i<arrayOfFlatObjects.length; i++){
        for(var j = 0; j<settings.length; j++){
            rows += '"' + arrayOfFlatObjects[i][settings[j]] + '"';
            if(j != settings.length - 1) rows += ','
        }
        rows += '\n'
    }

    var csvBody = headers + rows;
    return csvBody;
};