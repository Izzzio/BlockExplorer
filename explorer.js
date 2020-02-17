/**
 * IZZZIO Blockchain explorer
 * @author Andrey Nedobylsky
 */

const MAX_BLOCKS_ON_PAGE = 15;

let nodes = ['wss://xn--90absg.xn--p1ai/vitamin/', "ws://localhost:6001"];
let candy = null;
let lastestBlocks = [];
let parsers = {};

let lastBlockInTable = 0;

let searchHooks = [];

$(document).ready(function () {
    $('#loadingModal').modal('show');
    $.get('nodes.json', function (data) {
        console.log(data);
        nodes = data;
        if(typeof data === 'string') {
            nodes = JSON.parse(data);
        }

    }).always(function () {
        startCandyConnection(nodes);
    });

    //startCandyConnection(nodes);

    $('.returnButton').click(function () {
        $('#lastestBlocksPage').fadeIn();
        $('#blockDetailPage').hide();
        $('#modalModulePage').hide();
    });

    $('.searchForm').on('submit', async function (event) {
        event.preventDefault();
        let search = $('#search').val();

        for (let hook of searchHooks) {
            if(await hook(search)) {
                window.location.hash = search;
                return;
            }
        }

        if(!isNaN(search)) {
            loadBlockPreview(search);
        } else {
            if(confirm('Search by hash may take a long time. Are you sure?')) {
                let blockId = 1;

                function checkBlock() {
                    candy.loadResource(blockId, function (err, block, rawBlock) {
                        if(rawBlock.hash.indexOf(search) !== -1) {
                            //alert('Block found: ' + blockId);
                            setTimeout(function () {
                                loadBlockPreview(blockId);
                            }, 500);
                            return;
                        }
                        blockId++;
                        $('#height').text(blockId + '/' + candy.blockHeight);

                        if(blockId > candy.blockHeight) {
                            alert('Block hash not found');
                            return;
                        }

                        checkBlock();
                    });
                }

                checkBlock();
            }
        }
    });

});

/**
 * Initiats candy connection
 * @param nodes
 */
function startCandyConnection(nodes) {
    function hideModal() {
        $('#loadingModal').fadeOut(1000);
        $('.modal-backdrop').fadeOut(1000);
        $('.modal-open').removeClass('modal-open');
    }

    candy = new Candy(nodes).start();

    candy.onready = function () {

        setInterval(function () {
            $('#height').text(candy.blockHeight);
            $('#connections').text(candy.getActiveConnections().length);
            if(candy.getActiveConnections().length === 0) {
                $('#loadingModal').modal('show').show();
                $('.modal-backdrop').show();
            } else {
                hideModal();
            }
        }, 1000);

        setInterval(function () {
            updateLatestBlocks();
        }, 5000);
        updateLatestBlocks();

        setTimeout(function () {
            if(window.location.hash.length !== 0) {
                $('#search').val(window.location.hash.replace('#', ''));
                $('.searchForm').submit();
            }
        }, 1000);

    };

    /*candy.onmessage = function (messageBody) {
        for (let a in waitingMessages) {
            if(waitingMessages.hasOwnProperty(a)) {
                if(waitingMessages[a].id === messageBody.id) {
                    if(waitingMessages[a].handle(messageBody)) {
                        delete waitingMessages[a];
                    }
                    return;
                }
            }
        }
    }*/
}


/**
 * Detect block type by params
 * @param rawBlock
 * @return {*}
 */
function detectBlockType(rawBlock) {
    try {
        let data = JSON.parse(rawBlock.data);
        if(typeof data.type !== 'undefined') {
            return data.type;
        }

        return "Unknown";
    } catch (e) {
        return "Unknown without data";
    }
}

/**
 * Block view href event
 */
function loadBlockPreview(index) {
    index = (isNaN(index) ? $(this).text() : index);
    candy.loadResource(index, function (err, block, rawBlock) {
        window.location.hash = index;
        let blockType = detectBlockType(rawBlock);
        $('#lastestBlocksPage').hide();
        $('#modalModulePage').hide();
        $('#blockDetailPage').fadeIn();

        $('.blockIndex').text(rawBlock.index);
        $('.blockSize').text(rawBlock.data.length);
        $('.blockHash').text(rawBlock.hash);
        $('.blockPrevHash').text(rawBlock.previousHash);
        $('.blockPrevious').text(rawBlock.index - 1);
        $('.blockNext').text(rawBlock.index + 1);
        $('.blockType').text(blockType);
        $('.blockTimestamp').text(moment(rawBlock.timestamp).format('LLLL'));
        $('.blockStartTimestamp').text(moment(rawBlock.startTimestamp).format('LLLL'));
        $('.blockData').text(rawBlock.data);
        $('.blockSign').text(rawBlock.sign);

        if(typeof parsers[blockType] !== 'undefined') {
            let parserResult = parsers[blockType](rawBlock);
            Promise.resolve(parserResult).then((value) => {
                $('.blockParserOutput').html(value);
            });

        } else {
            $('.blockParserOutput').text('No parser for this block type');
        }


    });
}


/**
 * Update latest blocks list
 */
function updateLatestBlocks() {

    function lastBlocksTableFormat() {

        function insertBlock(rawBlock) {

            if(rawBlock.index > lastBlockInTable) {
                lastBlockInTable = rawBlock.index;
            }

            return $('#lastTransactions tbody > tr:last').after(
                "                    <tr>\n" +
                "                        <td> <a href='#' class='blockHref'>" + rawBlock.index + "</a></td>\n" +
                "                        <td>" + detectBlockType(rawBlock) + "</td>\n" +
                "                        <td>" + moment().from(moment(rawBlock.timestamp)) + "</td>\n" +
                "                        <td>" + rawBlock.data.length + "</td>\n" +
                "                    </tr>"
            );
        }

        let old;
        old = $('#lastTransactions  tbody > tr').fadeOut(500);
        setTimeout(function () {
            lastestBlocks.forEach(function (block) {
                insertBlock(block.raw).hide().fadeIn(100);
            });
            old.remove();

            $('.blockHref').click(loadBlockPreview);

        }, 500);

    }

    lastestBlocks = [];
    if(candy.blockHeight !== 0 && lastBlockInTable !== candy.blockHeight) {
        let maxBLocksOnPageLimited = MAX_BLOCKS_ON_PAGE;
        if(maxBLocksOnPageLimited > candy.blockHeight) {
            maxBLocksOnPageLimited = candy.blockHeight /*- 1*/;
        }
        for (let i = candy.blockHeight; i > candy.blockHeight - maxBLocksOnPageLimited; i--) {
            candy.loadResource(i, function (err, block, rawBlock) {
                lastestBlocks.push({id: rawBlock.index, raw: rawBlock, data: block});
                if(lastestBlocks.length >= maxBLocksOnPageLimited || lastestBlocks.length >= candy.blockHeight) {
                    lastestBlocks = lastestBlocks.sort(function (b1, b2) {
                        return (b2.id - b1.id)
                    });
                    lastBlocksTableFormat();
                }
            });
        }
    }
}


/**
 * Loads parser module
 * Example: loadParser('parsers/EcmaContractDeploy.js');
 * @param {string} uri
 */
function loadParser(uri) {
    $.getScript(uri);
}

/**
 * Registers search hook
 * @param {Function} hookFunction
 */
function registerSearchHook(hookFunction) {
    searchHooks.push(hookFunction);
}

/**
 * Opens modal page with custom content
 * @param {string} modalHeader
 * @param {string} modalContent
 */
function showModalPage(modalHeader, modalContent) {
    $('#lastestBlocksPage').hide();
    $('#blockDetailPage').hide();
    $('#modalModulePage').fadeIn();

    $('#modalHeader').html(modalHeader);
    $('#modalContent').html(modalContent);
}