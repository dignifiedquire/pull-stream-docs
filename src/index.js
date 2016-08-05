const fs = require('fs')
const inu = require('inu')
const pull = inu.pull
const find = require('array-find')
const css = require('sheetify')

css('normalize.css')
css('./main.css', {global: true})

const model = JSON.parse(
  fs.readFileSync(__dirname + '/model.json', 'utf8')
)

const router = require('./router')
const nav = require('./views/nav')
const modulePage = require('./views/module-page')

const prefix = css`
  .wrapper {
    width: 100%;
    max-width: 1080px;
    margin: 0 auto;
    padding: 0 30px;
  }

  nav {
    position: fixed;
    max-width: 240px;
    top: 0px;
    left: 30px;
    max-height: 100%;
    border-radius: 4px;
    overflow-x: hidden;
    overflow-y: scroll;
    background: #FDFDFD;
    margin-top: 0px;
    width: 100%;
  }

  nav a {
    text-decoration: none;
  }

  nav > ul.categories {
    list-style: none;
    padding-left: 0;
  }

  nav ul.modules {
    list-style: none;
    padding-left: 0;
  }

  nav ul.modules li a {
    font-size: 15px;
    line-height: 18px;
    font-weight: 300;
  }

  article {
    float: right;
    clear: both;
    max-width: 720px;
    width: 100%;
  }

  @media screen and (max-width: 1180px) {
    article {
      max-width: 600px;
      margin-right: 60px;
    }
   }

  article pre {
    margin: 1.5em 0;
    overflow-x: auto;
  }

  article pre > code {
    overflow-x: auto;
    white-space: inherit;
    padding: 1em 1.5em;
  }
`

const app = {
  init: () => {
    const routerState = router.init()
    return {
      model: Object.assign(model, {
        modules: model.modules.map((module) => {
          return Object.assign(module, {
            contributors: deIndexContributors(model.contributors, module.contributors)
          })
        }),
        route: routerState.model
      }),
      effect: routerState.effect
    }
  },
  update: (model, action) => {
    const domain = action.type.split(':')[0]
    if (domain === 'router') {
      return {
        model: Object.assign({}, model, {
          route: router.update(model, action).model
        })
      }
    }
    return { model: model }
  },
  view: (model) => {
    const route = model.route || 'pull-stream'
    const module = find(model.modules, (module) => {
      return module.name === route
    })

    return inu.html`
      <main class=${prefix}>
        <div class='wrapper'>
          ${nav(model)}
          ${modulePage(module)}
        </div>
      </main>
    `
  },
  run: router.run
}

const main = document.querySelector('main')

pull(
  inu.start(app).views(),
  pull.drain((view) => {
    inu.html.update(main, view)
  })
)

function deIndexContributors (indexed, contributors) {
  return contributors.map((index) => indexed[index])
}
