set encoding=utf-8
set backspace=2   " Backspace deletes like most programs in insert mode
set nobackup
set nowritebackup
set noswapfile    " http://robots.thoughtbot.com/post/18739402579/global-gitignore#comment-458413287
set history=5000
set ruler         " show the cursor position all the time
set showcmd       " display incomplete commands
set incsearch     " do incremental searching
set laststatus=2  " Always display the status line
set autowrite     " Automatically :write before running commands
set modelines=0   " Disable modelines as a security precaution
set nomodeline
set t_Co=256
set number
set undodir=~/.vim/undodir
set undofile  " save undos
set undolevels=10000  " maximum number of changes that can be undone
set undoreload=100000  " maximum number lines to save for undo on a buffer reload
set noshowmode  " keep command line clean
set noshowcmd
set noerrorbells  " remove bells (i think this is default in neovim)
set visualbell
set t_vb=
set relativenumber
set viminfo='20,<1000  " allow copying of more than 50 lines to other applications
set completeopt=menuone,noselect,noinsert
set shortmess+=c
syntax enable
filetype plugin indent on
"au BufWrite * :ALEFix

" Display extra whitespace
"set list listchars=tab:»·,trail:·,nbsp:·
" Use one space, not two, after punctuation.
set nojoinspaces
" Make it obvious where 14 characters is
"set textwidth=140
set colorcolumn=80,140
"highlight ColorColumn guibg=green
set complete+=kspell

"enable  gitguter
let g:gitgutter_enabled = 0
"enable rainbo
let g:rainbow_active = 1

" Specify a directory for plugins
call plug#begin('~/.vim/plugged')

Plug 'w0rp/ale'
Plug 'itchyny/calendar.vim'
Plug 'airblade/vim-gitgutter'
Plug 'dougbeney/vim-reddit'
Plug 'freitass/todo.txt-vim'
Plug 'tpope/vim-fugitive'
Plug 'tpope/vim-surround'
Plug 'scrooloose/nerdtree'
Plug 'tiagofumo/vim-nerdtree-syntax-highlight'  "to highlight files in nerdtree
Plug 'scrooloose/syntastic'
Plug 'altercation/vim-colors-solarized'
Plug 'plasticboy/vim-markdown'
Plug 'vim-airline/vim-airline'
Plug 'vim-airline/vim-airline-themes'
Plug 'dracula/vim', { 'as': 'dracula' }
Plug 'chiel92/vim-autoformat'
Plug 'puppetlabs/puppet-syntax-vim'
Plug 'tmux-plugins/vim-tmux'
Plug 'frazrepo/vim-rainbow'
Plug 'dpelle/vim-LanguageTool'
Plug 'vim-mail/vim-mail'
Plug 'ekalinin/dockerfile.vim'
Plug 'hdima/python-syntax'
Plug 'chrisbra/csv.vim'
Plug 'hallison/vim-markdown'
Plug 'mboughaba/i3config.vim'
Plug 'kien/rainbow_parentheses.vim'
Plug 'xuyuanp/nerdtree-git-plugin'
Plug 'python-mode/python-mode', { 'for': 'python', 'branch': 'develop' }
Plug 'davidhalter/jedi-vim'
Plug 'roxma/nvim-yarp'
Plug 'majutsushi/tagbar'  " show tags in a bar (functions etc) for easy browsing
Plug 'jonathanfilip/vim-lucius'  " nice white colortheme
Plug 'Vimjas/vim-python-pep8-indent'  "better indenting for python
Plug 'kien/ctrlp.vim'  " fuzzy search files
Plug 'tweekmonster/impsort.vim'  " color and sort imports
Plug 'wsdjeg/FlyGrep.vim'  " awesome grep on the fly
Plug 'airblade/vim-gitgutter'  " show git changes to files in gutter
Plug 'tpope/vim-commentary'  "comment-out by gc
Plug 'roxma/nvim-yarp'  " dependency of ncm2
Plug 'ncm2/ncm2'  " awesome autocomplete plugin
Plug 'HansPinckaers/ncm2-jedi'  " fast python completion (use ncm2 if you want type info or snippet support)
Plug 'ncm2/ncm2-bufword'  " buffer keyword completion
Plug 'ncm2/ncm2-path'  " filepath completion
Plug 'prettier/vim-prettier', { 'do': 'yarn install' } "instal Preier which auto format the text
Plug 'ycm-core/YouCompleteMe'
Plug 'plasticboy/vim-markdown'
Plug 'hail2u/vim-css3-syntax'
Plug 'ap/vim-css-color'
" Initialize plugin system
call plug#end()



"Plugins Config
let g:NERDTreeDirArrowExpandable = '▸'
let g:NERDTreeDirArrowCollapsible = '▾'
let g:airline_powerline_fonts = 1
let g:prettier#exec_cmd_path = "/usr/bin/prettier"
let g:prettier#autoformat = 0
let g:prettier#config#single_quote = 'true'
let g:prettier#config#bracket_spacing = 'false'
let g:prettier#config#parser = 'flow'
let g:prettier#quickfix_enabled = 0
let g:formatterpath = ['/usr/bin/shfmt']
let b:ale_fixers = ['prettier', 'shfmt', 'puppetlint','fecs', 'stylelint', 'remove_trailing_lines', 'trim_whitespace']
" ale options
let g:ale_python_flake8_options = '--ignore=E129,E501,E302,E265,E241,E305,E402,W503'
let g:ale_python_pylint_options = '-j 0 --max-line-length=120'
let g:ale_list_window_size = 4
let g:ale_sign_column_always = 0
let g:ale_open_list = 1
let g:ale_keep_list_window_open = '1'
" make it fast
let ncm2#popup_delay = 5
let ncm2#complete_length = [[1, 1]]
" Use new fuzzy based matches
let g:ncm2#matcher = 'substrfuzzy'

let g:ale_sign_error = '‼'
let g:ale_sign_warning = '∙'
let g:ale_lint_on_text_changed = 'never'
let g:ale_lint_on_enter = '0'
let g:ale_lint_on_save = '1'

let g:pymode_options_colorcolumn = 0



"Nerdtree Git PLug in 
let g:NERDTreeIndicatorMapCustom = {
    \ "Modified"  : "✹",
    \ "Staged"    : "✚",
    \ "Untracked" : "✭",
    \ "Renamed"   : "➜",
    \ "Unmerged"  : "═",
    \ "Deleted"   : "✖",
    \ "Dirty"     : "✗",
    \ "Clean"     : "✔︎",
    \ 'Ignored'   : '☒',
    \ "Unknown"   : "?"
    \ }


"Custom Commands
command Wdiff :w !diff % -
command W :w !sudo tee %
command Pipe !git-pipeline-status

" ncm2 settings
"autocmd BufEnter * call ncm2#enable_for_buffer()
inoremap <c-c> <ESC>
"auto indent for brackets
nmap <leader>w :w!<cr>
nmap <leader>q :lcl<cr>:q<cr>
nnoremap <leader>h :nohlsearch<Bar>:echo<CR>
"Keyboard mapping
map <C-n> :NERDTreeToggle<CR>
map <C-j> :tabprevious<CR>
map <C-k> :tabnext<CR>


highlight VertSplit ctermbg=253

" highlight python and self function
hi def link pythonFunction Function
highlight self ctermfg=239


"Remove all trailing whitespace by pressing C-S
nnoremap <C-S> :let _s=@/<Bar>:%s/\s\+$//e<Bar>:let @/=_s<Bar><CR>
autocmd BufReadPost quickfix nnoremap <buffer> <CR> <CR>
