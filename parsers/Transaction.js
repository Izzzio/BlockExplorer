/**
 * Transaction parser for Vitamin block explorer
 */

if(typeof parsers === 'undefined') {
    console.log("Can't detect Vitamin block explorer script");
} else {

    parsers['Transaction'] = function (rawBlock) {
        try {
            var data = JSON.parse(rawBlock.data);
        } catch (e) {
            return 'Data parsing error';
        }

        return 'Transaction: <br><b>From wallet id:</b><br>' + data.from + '<br><b>To wallet id:</b><br>' + data.to + '<br><b>Amount:</b><br>' + data.amount;

    };
}