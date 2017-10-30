/**
 * Smart parser for Vitamin block explorer
 */

if(typeof parsers === 'undefined') {
    console.log("Can't detect Vitamin block explorer script");
} else {

    parsers['Smart'] = function (rawBlock) {
        try {
            var data = JSON.parse(rawBlock.data);
        } catch (e) {
            return 'Data parsing error';
        }

        return 'Smart contract code:<br><code>'+data.smart+'</code>';

    };
}