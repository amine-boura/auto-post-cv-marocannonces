import { createLink , get_page_links , get_active_link , get_title } from './helpers.js'
import { config } from './config.js';
import { select } from './selectors.js'
import { msg }    from './messages.js'

const { domaine , ville } = config

const printTitle = async (page) =>{
    const t = await page.title()
    const parts = t.split('|')
    const title = parts[0]
    console.log(`${msg.navigate_to_page}${title}\n`)
}

const pressEnter = async ({ page , print_title = true} ) =>{
    await page.keyboard.press("Enter")
    await page.waitForNavigation({ timeout : 0 })
    print_title && await printTitle(page)
}

const navigate = async ({ to , page , print_title = false}) => {
    await page.goto( to , { waitUntil: "networkidle2" , timeout : 0 })
    print_title && await printTitle(page)
}

const typeToInput = async ( { selector ='' , input = '' , page  } ) =>{
    await page.waitForSelector( selector , {timeout:0} )
    await page.type( selector , input , { delay:10 } )
} 

const postuler = async ({ link , page })=>{

    await navigate({ to: link , page })
    await page.waitForSelector( select.title , { timeout : 0 })
    const title = await get_title(page)
    await page.waitForSelector('#btn_envoyer' , { timeout : 0 })
    await page.waitForTimeout(5000)
    await page.click('#btn_envoyer')
    console.log(`${msg.apply_to}#${title}\n`) 
}

const getAllLinks = async ( { maxPost = 1 , page } ) => {

        console.log(`${msg.etape_1}`)

        let page_number = 1
        let all_links = []

        while ( page_number <= maxPost ){

            const targetLink = createLink({ page_number , domaine , ville })

            console.log(`${msg.navigate_to}${page_number}`)

            await navigate({ to: targetLink , page })

            console.log(`${msg.check_selector}`)

            const isExist = await page.$(select.annonces_list)

            console.log(`${msg.selector_exist}${!!isExist} \n`)

            if(!isExist) break

            const page_links = await get_page_links(page)

            all_links = [...all_links , ...page_links]

            page_number++
        }

        console.log(`${msg.return_all_links}`)
        return all_links
}

const getActiveLinks = async ({ all_links = [] , page , postulation = true }) => {

    console.log(`${msg.etape_2}`)

    let activeLinks = []
    let current_link = ''

    for (const link of all_links){

        console.log(`${msg.check_link}`)

        await navigate({ to: link , page })

        const isError_404 = await page.$(select.error_404)

        if( ! isError_404 ){

            current_link = await get_active_link(page)

            console.log(`${msg.actif_link_found}${current_link}`)

            postulation && await postuler({ link: current_link , page })

            activeLinks = [...activeLinks , current_link ]

            await page.waitForTimeout(3000)

        } else {

            console.log(`${msg.inactif_link_found}${current_link}`)

            console.log(`${msg.delete_link}`)
        }
        
    }
    console.log(`${msg.number_annonces}${activeLinks.length}\n`)
    console.log(`${msg.return_all_links}\n`)
    console.log(activeLinks)
    return activeLinks
}

export { getAllLinks , getActiveLinks , typeToInput , navigate , pressEnter }