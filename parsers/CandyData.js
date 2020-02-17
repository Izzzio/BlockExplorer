/**
 * Candy data parser for IZZZIO block explorer
 */

if(typeof parsers === 'undefined') {
    console.log("Can't detect IZZZIO block explorer script");
} else {

    function b64DecodeUnicode(str) {
        return decodeURIComponent(atob(str).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
    }

    parsers['CandyData'] = function (rawBlock) {
        try {
            var data = JSON.parse(rawBlock.data);
        } catch (e) {
            return 'Data parsing error';
        }

        if(typeof data.candyData !== 'undefined') {
            if(data.candyData.indexOf('image') !== -1) {
                return "Detected image data: <br><img src='" + data.candyData + "' style='max-width: 20vh'>";
            } else if(data.candyData.indexOf('text') !== -1) {
                return "Detected text data: <br><code>" + b64DecodeUnicode(data.candyData.split('base64,')[1]) + "</code>";
            } else {
                return "Detected other binary data";
            }
        } else {
            return "No CandyData field";
        }

    };
}