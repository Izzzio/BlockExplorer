/**
 * Test parser for IZZZIO block explorer
 */

console.log('TEST parser loaded');

if(typeof parsers === 'undefined') {
    console.log("Can't detect IZZZIO block explorer script");
} else {

    parsers['Test'] = async function (rawBlock) {
        try {
            var data = JSON.parse(rawBlock.data);
        } catch (e) {
            return 'Data parsing error';
        }

        return 'Test block src:<br><code>' + JSON.stringify(data, undefined, 2) + '</code>';

    };
}