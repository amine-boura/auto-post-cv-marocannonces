import fs from 'fs';
import { config } from './config.js'
import { select } from './selectors.js'

const { baseUrl } = config

const loadData = ( filename ) =>{
    console.log(`Data Loading From : ${filename}`)
    const loadedData = fs.existsSync(filename)
    ? fs.readFileSync(filename).toString()
    : `null`
    const data = [...JSON.parse(loadedData)]
    return data
}

const saveData = ( filename , data = null ) =>{
    fs.writeFileSync(filename, JSON.stringify(data))
    console.log(`Date Saved To : ${filename}`)
}

const getVilleCode = ( ville = "" ) =>{
    let _ville = ville.toLowerCase()
    const _codes = {
        agadir : "t552",
        taroudant : "t800",
        tanger : "t601",
        casablanca : "t563",
    }
    return _codes[_ville] || _codes["agadir"]
}

const getDomaineName = ( domaine = "" ) =>{

    const _domaine = domaine.toLowerCase()
    const domaines = {
        informatique : { 
            domaine : "informatique-multimedia-internet" , 
            encodedDomaine : "Informatique+%2F+Multimédia+%2F+Internet"
        },
        hotellerie : { 
            domaine : "tourisme-hotellerie-restauration" , 
            encodedDomaine : "Tourisme+%2F+Hôtellerie+%2F+Restauration"
        },
        chimie : { 
            domaine : "biologie-chimie-pharmaceutique" , 
            encodedDomaine : "Biologie+%2F+Chimie+%2F+Pharmaceutique"
        },
        agriculture : { 
            domaine : "agriculture-environnement-espaces-verts" , 
            encodedDomaine : "Agriculture+%2F+Environnement+%2F+Espaces+Verts"
        }
    }
    return domaines[_domaine] || domaines["informatique"]
}

const createLink = ({ page_number, domaine = "", ville = "" }) =>{
    const _offers_url = config.offers_url
    const _domaine = getDomaineName(domaine)
    const _domaine_name = _domaine.domaine
    const _encodedDomaine_name = _domaine.encodedDomaine
    const _villeCode = getVilleCode(ville)
    const _ville = ville.toLocaleLowerCase()
    const _last_part = page_number ? `&pge=${page_number}` : ``
    return `${_offers_url}-${_domaine_name}-${_ville}-b309-${_villeCode}.html?f_3=${_encodedDomaine_name}${_last_part}`
}

const get_page_links = async ( page ) =>{
    const all_links = await page.$$eval(
        select.annonce_link, 
        elems => elems.map(el => `${el.getAttribute("href")}`)
        )
    const get_links = all_links.map( link => `${baseUrl}${link}`)
    return get_links
}

const get_active_link = async ( page ) =>{
    const active_link = await page.$eval(select.btn_reply, el => el.getAttribute("href"))
    const link =  `${baseUrl}${active_link}`
    return link
}

const get_title = async ( page ) =>{
    const _title = await page.$eval(
        select.title,
         el => el.getAttribute('title')
        )
    const title = _title.split('#')[1]
    return title
}



export { loadData , saveData , createLink , get_page_links , get_active_link , get_title }