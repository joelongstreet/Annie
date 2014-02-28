var baseURL     = 'https://passport.vml.com/rest/';
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
            // When on any user filtering screen
            fetchURL = usersURL + '&' + tab.url.split('?')[1];
        } else if(tab.url.indexOf('/user/') != -1){
            // When on an individual profile page
            var splits      = tab.url.split('/');
            var username    = splits[splits.length - 1];
            fetchURL        = baseURL + 'user/' + username + '/ui.json';
        } else if(tab.url.indexOf('/group/') != -1){
            // When on the group members page
            var splits      = tab.url.split('/');
            var groupId     = splits[splits.length - 2];
            fetchURL        = usersURL + '&f[0]=og_user_node:' + groupId;
        } else fetchURL = usersURL;
    }
});


// Wait for a message from the background script
chrome.extension.onMessage.addListener(function(message, sender, sendResponse){
    $.ajax({
        url     : fetchURL,
        success : function(data, msg, jqXHR){
            var users   = parseUserData(data, message.fieldNames);
            var csvBody = createCSV(users, message.fieldNames, message.fieldTexts);
            sendResponse({ csv : csvBody });
        }, error : function(jqXHR, message, exception){
            sendResponse({ error : message });
        }
    });

    return true;
});


// This will do it's best job of flattening deep objects 
// for this particular kind of response.
var flatten = function(data){
    if(!data) return '';
    if(typeof(data) == 'string') return data;
    if(typeof(data == 'object')){
        // If we're working with an array
        if(data.length){
            var stringedArray = '';
            for(var i=0; i<data.length; i++){
                if(data[i].label) stringedArray += data[i].label;
                else stringedArray += data[i];

                if(i != data.length - 1) stringedArray += ', ';
            }
            return stringedArray;
        }
        // If it's an object
        else{
            if(data.label) return data.label;
            if(data.urls) return data.urls['default'];
            var keys = Object.keys(data);
            return data[keys[0]];
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


var createCSV = function(arrayOfFlatObjects, fieldNames, fieldTexts){
    var headers     = '';
    var rows        = '';

    for(var i = 0; i<fieldTexts.length; i++){
        headers += fieldTexts[i];
        if(i != fieldTexts.length - 1) headers += ',';
        else headers += '\n';
    }

    for(var j=0; j<arrayOfFlatObjects.length; j++){
        for(var k=0; k<fieldNames.length; k++){
            rows += '"' + arrayOfFlatObjects[j][fieldNames[k]] + '"';
            if(k != fieldNames.length - 1) rows += ',';
        }
        rows += '\n';
    }

    var csvBody = headers + rows;
    return csvBody;
};