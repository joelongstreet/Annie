# Annie
This project is a chrome extension which works with VML's corporate intra net. It allows registered users to download .csv's of filtered employee data by using a combination of the intra net web interface as well as this extension.

[Annie Schmader](http://passport.vml.com/ui/user/aschmader), the *Director of First Impressions* at VML, inspired development of this plug in. One of her many jobs is to verify various types of employee data by cross checking intra net data with human resources data. This extension aims to assist Annie in this task.



## Usage
* [Download the plug in](https://chrome.google.com/webstore/detail/annie/bckboiechjnkhdmjielfbnhmahchjifg) from the Chrome extension store.
* Navigate to any page on Passport with a user listing. Examples - `/users`, `/users?f[0]=field_department:614`, `/user/12345`, `/group/12345/users`, etc.
* Click the new "A" (for Annie) button in your web browser's URL bar.
* Select which fields you'd like to collect and click "Build .csv".
* After a moment, the "Download .csv" button will appear, allowing you to download a spreadsheet of user data.



## Developing
This chrome extension uses [page actions](http://developer.chrome.com/extensions/pageAction) to build the user interface and [background scripts](http://developer.chrome.com/extensions/background_pages) to collect data from the Passport API.

If you load hit [chrome://extensions](chrome://extensions) in your web browser, you can turn on developer mode and load an unpacked extension (this directory).

* Good overview of Chrome extensions - [https://developer.chrome.com/extensions/getstarted](https://developer.chrome.com/extensions/getstarted)
* Debugging an extension - [https://developer.chrome.com/extensions/tut_debugging](https://developer.chrome.com/extensions/tut_debugging)