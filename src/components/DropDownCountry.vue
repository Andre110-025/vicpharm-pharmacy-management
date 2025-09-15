<script setup>
const open = ref(false);
const selectedFlag = ref("us");
const selectedCode = ref("+1");

const countries = [
  { flag: "us", code: "+1" },
  { flag: "gb", code: "+44" },
  { flag: "ng", code: "+234" },
];

const selectCountry = (country) => {
  selectedFlag.value = country.flag;
  selectedCode.value = country.code;
  open.value = false;
};
</script>


<template>
    <div class="relative w-full flex items-center border border-gray-400 rounded-md">
                        <!-- Country Dropdown -->

        <div class="relative">
            <button @click="open = !open" class="flex items-center gap-2 px-3 h-[40px] border-r border-gray-400 rounded-l-md">
                <img :src="`https://flagcdn.com/w40/${selectedFlag}.png`" class="w-5 h-5" alt="Flag">
                <span>{{ selectedCode }}</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
                </svg>
            </button>

            <!-- Dropdown Items -->
            <div v-if="open" class="absolute left-0 mt-1 w-[120px] bg-white border border-gray-300 rounded shadow-md">
                <button v-for="country in countries" :key="country.code" @click="selectCountry(country)" class="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100">
                    <img :src="`https://flagcdn.com/w40/${country.flag}.png`" class="w-5 h-5" :alt="`${country.flag} Flag`">
                    <span>{{ country.code }}</span>
                </button>
            </div>
        </div>

        <!-- Phone Input -->
        <input 
            type="text"
            required
            class="w-[470px] h-[40px] border border-gray-400 px-4 pr-10 rounded-md focus:outline-none focus:ring-1 focus:ring-mainColor"
            placeholder="913 673 909"
        />
    </div>
</template>