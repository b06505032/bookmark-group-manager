const url = 'https://bookmark-group-manager.vercel.app'
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse){
        const data = request.payload
        
        if (data.msg === 'logout') {
            chrome.cookies.set({
                url  : url,
                name : 'account',
                value : '%7B%22name%22%3A%22%22%2C%22password%22%3A%22%22%7D'
            }, function(msg){
                // console.dir(msg)
            })
            chrome.cookies.set({
                url  : url,
                name : 'login',
                value : 'false'
            }, function(msg){
                // console.dir(msg)
            })
        }
        else if ( data.name === '' || data.password === ''){
            chrome.cookies.set({
                url  : url,
                name : 'account',
                value : '%7B%22name%22%3A%22%22%2C%22password%22%3A%22%22%7D'
            }, function(msg){
                // console.dir(msg)
            })
            chrome.cookies.set({
                url  : url,
                name : 'login',
                value : 'false'
            }, function(msg){
                // console.dir(msg)
            })
        }
        else {
            const data = request.payload
            // window.open(url, '_blank')
            chrome.cookies.set({
                url  : url,
                name : 'account',
                value : `%7B%22name%22%3A%22${data.name}%22%2C%22password%22%3A%22${data.password}%22%7D`
            }, function(msg){
                // console.dir(msg)
            })
            chrome.cookies.set({
                url  : url,
                name : 'login',
                value : 'true'
            }, function(msg){
                // console.dir(msg)
            })
        }
        window.open('https://bookmark-group-manager.vercel.app', '_blank')
    }
)
