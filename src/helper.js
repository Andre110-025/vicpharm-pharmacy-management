export function useHelpers() {
  // Product Category List

  const productCategoryList = [
    'analgesic creams',
    'analgesic eye drop',
    'analgesics',
    'antacids',
    'anti arthritis',
    'anti glaucoma eye drops',
    'antiallergic creams',
    'antiallergic eye drops',
    'antiallergics',
    'antianxiety',
    'antiasthmatics',
    'antibacterial creams',
    'antibacterial eye drop',
    'antibacterial syrups',
    'antibiotics',
    'anticonvulsants',
    'antidepressants',
    'antidiabetics',
    'antidiarrheals',
    'antiedema',
    'antiemetics',
    'antifungal creams',
    'antifungal eyedrop',
    'antifungals',
    'antihaemorroidal',
    'antihelminthics',
    'antihypertensives',
    'antimalarials',
    'antiplatelets',
    'antiprotozaol drugs',
    'antipruritic creams',
    'antipruritic drugs',
    'antiretroviral drugs',
    'antiscabies',
    'antiseizures',
    'antiseptics',
    'antispasmodics',
    'antithyroid',
    'antituberculosis drugs',
    'antitussive',
    'antiulcers',
    'antiviral creams',
    'antiviral eyedrops',
    'antivirals',
    'appetite stimulant',
    'blood tonics',
    'burn creams',
    'cardiac drugs',
    'cleansers',
    'cold drugs(anticatarrh)',
    'contraceptive',
    'cosmetics',
    'dietary supplement',
    'diuretics',
    'drugs for constipation',
    'drugs for prostate',
    'energy drinks',
    'erectile disfunction drug',
    'hepatoprotectors',
    'hormonal drugs',
    'household',
    'hypnotics/sedatives',
    'infusions',
    'laxative',
    'libido enhancement drugs',
    'lipid lowering agent',
    'local anesthetic creams',
    'medical consumables',
    'multivitamins',
    'nasal decongestants',
    'nerve drugs',
    'parenterals',
    'sleep aid',
    'steroid tablets',
    'supplements',
    'surgical materials',
    'urinary alkalinizers',
    'vaccine',
  ]

  // Format date to DD/MM/YYYY
  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  const formatDateTime = (inputDate) => {
    const date = new Date(inputDate)

    // Format the date to 'Sun 24 Nov 2024'
    const formattedDate = date.toLocaleDateString('en-GB', {
      weekday: 'short', // Sun
      day: '2-digit', // 24
      month: 'short', // Nov
      year: 'numeric', // 2024
    })

    return formattedDate
  }

  const formatTime = (inputDate) => {
    const date = new Date(inputDate)

    // Format the date to 'Sun 24 Nov 2024'
    const formattedTime = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })

    return formattedTime
  }

  return {
    productCategoryList,
    formatDate,
    formatDateTime,
    formatTime,
  }
}
