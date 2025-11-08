function newContact(key, whenValue, callback) {
    let interval = setInterval(() => {
        let currentValue = localStorage.getItem(key);
        if (currentValue === whenValue) {
            clearInterval(interval);
            localStorage.removeItem(key);
            callback();
        }
    });
}

function setContact(key, value) {
    localStorage.setItem(key, value);
}