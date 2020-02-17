/**
 * EcmaContractDeploy parser for block explorer
 */

$.getScript("https://cdnjs.cloudflare.com/ajax/libs/js-beautify/1.10.0/beautify.js");

if(typeof parsers === 'undefined') {
    console.log("Can't detect block explorer script");
} else {

    parsers['EcmaContractDeploy'] = function (rawBlock) {
        let data;
        try {
            data = JSON.parse(rawBlock.data);
        } catch (e) {
            return 'Data parsing error';
        }



        data.ecmaCode = js_beautify(data.ecmaCode);

        return `<b>Sender:</b><br>${data.pubkey}<br><b>Code hash:</b><br>${data.state.codeHash}<br><b>Contract code</b><br><textarea style="width: 100%; min-height: 500px;" readonly>${data.ecmaCode}</textarea>`;

    };
}