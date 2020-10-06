"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const floatBuffer_1 = tslib_1.__importDefault(require("../model/floatBuffer"));
const workspace_1 = tslib_1.__importDefault(require("../workspace"));
const logger = require('../util/logger')('floating');
class Floating {
    constructor() {
        this.winid = 0;
        this.bufnr = 0;
        this.floatBuffer = new floatBuffer_1.default(workspace_1.default.nvim);
        let configuration = workspace_1.default.getConfiguration('suggest');
        let enableFloat = configuration.get('floatEnable', true);
        let { env } = workspace_1.default;
        if (enableFloat && !env.floating && !env.textprop) {
            enableFloat = false;
        }
        this.config = {
            srcId: workspace_1.default.createNameSpace('coc-pum-float'),
            maxPreviewWidth: configuration.get('maxPreviewWidth', 80),
            enable: enableFloat
        };
    }
    async show(docs, bounding, token) {
        if (!this.config.enable)
            return;
        await this.showDocumentationFloating(docs, bounding, token);
    }
    async showDocumentationFloating(docs, bounding, token) {
        let { nvim } = workspace_1.default;
        let config = this.calculateBounding(docs, bounding);
        if (!config || token.isCancellationRequested)
            return;
        await this.floatBuffer.setDocuments(docs, config.width);
        if (token.isCancellationRequested)
            return;
        let res = await nvim.call('coc#util#create_float_win', [this.winid, this.bufnr, config]);
        if (!res)
            return;
        let winid = this.winid = res[0];
        let bufnr = this.bufnr = res[1];
        if (token.isCancellationRequested) {
            this.close();
            return;
        }
        nvim.pauseNotification();
        if (workspace_1.default.isNvim) {
            nvim.command(`noa call win_gotoid(${winid})`, true);
            this.floatBuffer.setLines(bufnr);
            nvim.command('noa normal! gg0', true);
            nvim.command('noa wincmd p', true);
        }
        else {
            this.floatBuffer.setLines(bufnr, winid);
            nvim.call('win_execute', [winid, `noa normal! gg0`], true);
            nvim.command('redraw', true);
        }
        let [, err] = await nvim.resumeNotification();
        if (err)
            logger.error(`Error on ${err[0]}: ${err[1]} - ${err[2]}`);
    }
    close() {
        if (!this.winid)
            return;
        let { winid } = this;
        this.winid = null;
        workspace_1.default.nvim.call('coc#util#close_win', [winid], true);
        if (workspace_1.default.isVim)
            workspace_1.default.nvim.command('redraw', true);
    }
    calculateBounding(docs, bounding) {
        let { config } = this;
        let { columns, lines } = workspace_1.default.env;
        let { maxPreviewWidth } = config;
        let pumWidth = bounding.width + (bounding.scrollbar ? 1 : 0);
        let showRight = true;
        let paddingRight = columns - bounding.col - pumWidth;
        if (bounding.col > paddingRight)
            showRight = false;
        let maxWidth = showRight ? paddingRight - 1 : bounding.col - 1;
        maxWidth = Math.min(maxPreviewWidth, maxWidth);
        let maxHeight = lines - bounding.row - workspace_1.default.env.cmdheight - 1;
        let { width, height } = floatBuffer_1.default.getDimension(docs, maxWidth, maxHeight);
        if (width == 0 || height == 0)
            return null;
        return {
            col: showRight ? bounding.col + pumWidth : bounding.col - width - 1,
            row: bounding.row,
            height,
            width,
            relative: 'editor'
        };
    }
}
exports.default = Floating;
//# sourceMappingURL=floating.js.map