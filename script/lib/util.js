
// https://stackoverflow.com/a/17546215
function escapeHTML(html){
    return document.createElement('div').appendChild(document.createTextNode(html)).parentNode.innerHTML;
}
