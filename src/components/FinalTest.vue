<template>
    <VueFinalModal
        v-if="isAddCustomerModalOpen"
        v-model="isAddCustomerModalOpen"
        class="flex h-full w-full items-center justify-center"
        content-class="relative bg-white border w-full h-[430px] max-w-[520px] rounded-2xl shadow-lg"
        overlay-class="bg-black/50 backdrop-blur-sm"
        :overlayTransition="'vfm-fade'"
        :contentTransition="'vfm-fade'"
        :clickToClose="true"
    >
        <div class="flex flex-row justify-between items-center p-6">
            <div class="flex flex-row items-center gap-3">
                <div class="w-10 h-10 bg-[rgba(175,53,133,0.1)] rounded-sm flex items-center justify-center">
                    <IconAccount class="w-7 h-8" />
                </div>
                <div class="flex flex-col">
                    <h2 class="text-lg font-semibold">Add Customer</h2>
                    <p class="text-gray-600">Add new customer to your business</p>
                </div>
            </div>
            <button 
                @click="isAddCustomerModalOpen = false" 
                class="border border-black rounded p-1 flex items-center justify-center"
            >
                <IconCancel color="black" class="w-5 h-5"/>
            </button>
        </div>
        <div class="ml-6">
            <form action="/action_page.php" class="flex flex-col gap-5">
                <input 
                    type="text"
                    required
                    class="w-[470px] h-[40px] border border-gray-400 px-4 pr-10 rounded-md focus:outline-none focus:ring-1 focus:ring-mainColor"
                    placeholder="Customer Name"
                />
                <div class="relative w-[470px] flex items-center rounded-md border border-gray-400">
                    <div class="relative">
                        <button @click="open = !open" class="flex items-center gap-2 px-3 h-[40px] border-r border-gray-400 rounded-l-md">
                            <img :src="`https://flagcdn.com/w40/${selectedFlag}.png`" class="w-5 h-5" alt="Flag">
                            <span>{{ selectedCode }}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
                            </svg>
                        </button>

                        <div v-if="open" class="absolute left-0 mt-1 w-[120px] bg-white rounded shadow-md">
                            <button v-for="country in countries" :key="country.code" @click="selectCountry(country)" class="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100">
                                <img :src="`https://flagcdn.com/w40/${country.flag}.png`" class="w-5 h-5" :alt="`${country.flag} Flag`">
                                <span>{{ country.code }}</span>
                            </button>
                        </div>
                    </div>
                    <input 
                        type="text"
                        required
                        class="w-[380px] h-[40px] px-4 pr-10 rounded-md focus:outline-none focus:ring-1 focus:ring-mainColor"
                        placeholder="817 104 369"
                    />
                </div>
                <div class="flex flex-row gap-3">
                    <select 
                        id="Country" 
                        name="Country"
                        class="w-[230px] h-[40px] border border-gray-400 px-2 pr-10 rounded-md focus:outline-none focus:ring-1 focus:ring-mainColor"
                    >
                        <option value="" disabled selected>Country</option>
                        <option value="South Africa">South Africa</option>
                        <option value="Egypt">Egypt</option>
                        <option value="India">India</option>
                        <option value="Australia">Australia</option>
                        <option value="Brazil">Brazil</option>
                    </select>
                    <select 
                        id="State" 
                        name="State"
                        class="w-[230px] h-[40px] border border-gray-400 px-2 pr-10 rounded-md focus:outline-none focus:ring-1 focus:ring-mainColor"
                    >
                        <option value="" disabled selected>States</option>
                        <option value="KwaZulu-Natal">KwaZulu-Natal</option>
                        <option value="Punjab ">Punjab </option>
                        <option value="Bavaria">Bavaria</option>
                        <option value="São Paulo ">São Paulo</option>
                        <option value="Queensland">Queensland</option>
                    </select>
                </div>
                <input 
                    type="text"
                    required
                    class="w-[470px] h-[40px] border border-gray-400 px-4 pr-10 rounded-md focus:outline-none focus:ring-1 focus:ring-mainColor"
                    placeholder="iammusic@gmail.com"
                />
            </form>
        </div>
        <div class="mt-3 bg-[#f7f8fa] h-[99px] rounded-bl-2xl rounded-br-2xl flex items-center">
            <div class="flex flex-row items-center justify-end space-x-2 w-full px-4">
                <button
                    class="px-4 py-2 border border-gray-400 rounded-md text-black hover:bg-gray-100 transition"
                >
                    <span class="text-[#9c417c]">Cancel</span>
                </button>
                <button 
                    class="mainBtn flex items-center justify-center transition duration-300 rounded-md"
                >
                    <IconAccount2 class="w-5 h-5" />
                    <span>Save Customer Info</span>
                </button>
            </div>
        </div>
    </VueFinalModal>
</template>