/**
 * EcmaContract call block
 */
if(typeof parsers === 'undefined') {
    console.log("Can't detect IZZZIO block explorer script");
} else {

    parsers['EcmaContractCallBlock'] = async function (rawBlock) {
        try {
            var data = JSON.parse(rawBlock.data);
        } catch (e) {
            return 'Data parsing error';
        }

        return `<b>Sender:</b><br>${data.pubkey}<br>
                <b>Address:</b><br>${data.address}<br>
                <b>Method:</b><br>${data.method}<br>
                <b>Arguments:</b><br><code>${JSON.stringify(data.args, undefined, 2).replace(/\n/g, '<br>').replace(/\s/g, '&nbsp;')}</code><br>`;


    };
}