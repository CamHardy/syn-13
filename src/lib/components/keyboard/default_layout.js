export let layout = {
    name: 'default',
    font: 'Geist Mono',
    pages: {
      default: {
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
      shift: {
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
    }