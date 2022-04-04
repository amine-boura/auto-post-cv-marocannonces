import   puppeteer   from 'puppeteer'

import  { config }   from './config.js'

import  { select }   from './selectors.js'

import  { saveData , createLink} from './helpers.js'

import  { getAllLinks , getActiveLinks , typeToInput , navigate , pressEnter } from './functions.js'



(async () => {

    console.time("Excution_Time")

    const { maxPost , email , password , loginPage , domaine , ville } = config

    const domainePage = createLink({ domaine , ville })

    const browser = await puppeteer.launch({ headless:false , defaultViewport:null });
    const page    = await browser.newPage();

    await navigate({ to: loginPage , page , print_title : true})

    await typeToInput({ selector : select.username, input : email , page })

    await typeToInput({ selector : select.password, input : password , page })

    await pressEnter({ page })

    await navigate({ to : domainePage , page , print_title : true })
    
    const all_links    = await getAllLinks({ maxPost , page })

    const active_links = await getActiveLinks({ all_links , page })

    saveData('./app/data.json' , active_links)

    console.timeEnd("Excution_Time")
  
    await browser.close()
})();

