<script>
  import {
    ArrowBigDown,
    ArrowBigUp,
    ArrowBigRightDash,
    ArrowDown,
    ArrowLeft,
    ArrowRight,
    ArrowUp
  } from '@lucide/svelte';

  /** @typedef { Object } Key
   * @property { string } [label]
   * @property { import('svelte').Component } [icon]
   * @property { string } [size]
   * @property { string } [value]
   * @property { Function } [action]
  */

  /** @typedef { Object } Layout
   * @property { string } name
   * @property { string } font
   * @property { Page[] } pages
  */

  /** @typedef { Object } Page 
   * @property { string } name
   * @property { Key[][] } rows
  */

  // intercept keyboard events and relay them (in case user REALLY wants to use their own keyboard, or maybe they're on desktop)
  // need letters (obviously), limited symbols, control, tab, escape, shift
  // no capital letters (shift is for symbols)
  
  //TODO: svelte get/set context
  
  // e 1 2 3 4 5 6 7 8 9 0
  // q w e r t y u i o p ∆
  // a s d f g h j k l { }
  // ^ , z x c v b n m . ✓
  // ? ^ v spaaaaace < > ×
  /** @type { Layout } /*/
  let layout = {
    name: 'default',
    font: 'Geist Mono',
    pages: [
      { 
        name: 'default',
        rows: [
          [
            {
              label: 'q',
              value: 'q'
            }, {
              label: 'w',
              value: 'w'
            }, {
              label: 'e',
              value: 'e'
            }, {
              label: 'r',
              value: 'r'
            }, {
              label: 't',
              value: 't'
            }, {
              label: 'y',
              value: 'y'
            }, {
              label: 'u',
              value: 'u'
            }, {
              label: 'i',
              value: 'i'
            }, {
              label: 'o',
              value: 'o'
            }, {
              label: 'p',
              value: 'p'
            }
          ], [
            {
              label: 'a',
              value: 'a'
            }, {
              label: 's',
              value: 's'
            }, {
              label: 'd',
              value: 'd'
            }, {
              label: 'f',
              value: 'f'
            }, {
              label: 'g',
              value: 'g'
            }, {
              label: 'h',
              value: 'h'
            }, {
              label: 'j',
              value: 'j'
            }, {
              label: 'k',
              value: 'k'
            }, {
              label: 'l',
              value: 'l'
            }
          ], [
            {
              icon: ArrowBigUp,
              action: () => setActivePage('shift')
            },
            {
              label: 'z',
              value: 'z'
            }, {
              label: 'x',
              value: 'x'
            }, {
              label: 'c',
              value: 'c'
            }, {
              label: 'v',
              value: 'v'
            }, {
              label: 'b',
              value: 'b'
            }, {
              label: 'n',
              value: 'n'
            }, {
              label: 'm',
              value: 'm'
            }, {
              icon: ArrowBigRightDash,
              value: 'enter'
            }
          ], [
            {
              icon: ArrowUp,
              value: 'arrow_up'
            }, {
              icon: ArrowDown,
              value: 'arrow_down'
            }, {
              value: 'blank'
            }, {
              label: 'space',
              value: ' ',
              size: '128px'
            }, {
              value: 'blank'
            }, {
              icon: ArrowLeft,
              value: 'arrow_left'
            }, {
              icon: ArrowRight,
              value: 'arrow_right'
            }
          ]
        ]
      }, 
      {
        name: 'shift',
        rows: [
          [
            {
              label: '$',
              value: '$'
            }, {
              label: '$',
              value: '$'
            }
          ], [
            {
              label: '$',
              value: '$'
            }
          ], [
            {
              icon: ArrowBigDown,
              action: () => setActivePage('default')
            }, {
              label: '$',
              value: '$'
            }
          ], [
            {
              icon: ArrowUp,
              value: 'arrow_up'
            }, {
              icon: ArrowDown,
              value: 'arrow_down'
            }, {
              value: 'blank'
            }, {
              label: 'space',
              value: ' ',
              size: '128px'
            }, {
              value: 'blank'
            }, {
              icon: ArrowLeft,
              value: 'arrow_left'
            }, {
              icon: ArrowRight,
              value: 'arrow_right'
            }
          ]
        ]
      }
    ]
  };
  
  /** @type { Page } */
  let activePage = $state(layout.pages[0]);
  
  let key_gap = '16px';
  
  let { trigger } = $props();
  
  /** @param { Key } key */
  function handleKeyPress(key) {
    key.action?.();
    if (key.value) {
      trigger(key.value)
    }
  }

  /** @param { string } name */
  function setActivePage(name) {
    activePage = layout.pages.find(page => page.name === name) ?? layout.pages[0];
  }
</script>

<div class="absolute bottom-0 w-full bg-black p-2 bg-gray-900 space-y-2">
  {#each activePage.rows as row}
    <div class="flex justify-center space-x-2">
      {#each row as key}
        {#if key.size}
          <!-- big key -->
          <button onclick={() => handleKeyPress(key)} class="flex justify-center items-center rounded border border-2 border-slate-500 font-medium text-slate-500 active:bg-slate-700 w-[144px] h-12 select-none">
            {#if key.icon}
              <key.icon/>
            {:else}
              {key.label}
            {/if}
          </button>
        {:else if key.value === 'blank'}
          <!-- blank key (ie empty space) -->
          <div class="w-[32px] h-12"></div>
        {:else}
          <!-- normie keys -->
          <button onclick={() => handleKeyPress(key)} class="flex justify-center items-center rounded border border-2 border-slate-500 font-medium text-slate-500 active:bg-slate-600 w-[32px] h-12 select-none">
            {#if key.icon}
              <key.icon/>
            {:else}
              {key.label}
            {/if}
          </button>
        {/if}
      {/each}
    </div>
  {/each}
</div>
