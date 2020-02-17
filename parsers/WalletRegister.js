/**
 * Wallet Register parser for IZZZIO block explorer
 */

if(typeof parsers === 'undefined') {
    console.log("Can't detect IZZZIO block explorer script");
} else {

    parsers['WalletRegister'] = function (rawBlock) {
        try {
            var data = JSON.parse(rawBlock.data);
        } catch (e) {
            return 'Data parsing error';
        }

        return 'New wallet registration: <br><b>Wallet id:</b><br>' + data.id + '<br><b>Wallet tiny id:</b><br>BL_' + rawBlock.index;

    };
}