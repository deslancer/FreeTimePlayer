let js_media_tags = require("jsmediatags");
export default class AudioTags {
    constructor() {
    }
    allTags(file){
        js_media_tags.read(file, {
            onSuccess: function(tag) {
                console.log(tag);
            },
            onError: function(error) {
                console.log(':(', error.type, error.info);
            }
        });
    }
}