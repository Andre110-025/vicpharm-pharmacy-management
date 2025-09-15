<script setup>
import IconCalender from './IconCalender.vue';
import IconCancel from './IconCancel.vue';

</script>

<template>
    <div>
        <div class="flex flex-col w-[700px] h-60 bg-white shadow-md rounded p-6 gap-3">
            <div class="flex flex-row justify-between items-center">
                <h3>Filter</h3>
                <button><IconCancel /></button>
            </div>
            <div class="flex flex-row justify-between items-center">
                <div class="flex flex-col">
                    <p>Number of orders</p>
                    <div class="flex flex-row gap-3">
                            <input 
                                type="text"
                                placeholder="Min"
                                class="w-[130px] h-[40px] border border-gray-300 px-4 pr-10 rounded-md focus:outline-none focus:ring-1 focus:ring-mainColor"
                            />
                            <input 
                                type="text"
                                placeholder="Max"
                                class="w-[130px] h-[40px] border border-gray-300 px-4 pr-10 rounded-md focus:outline-none focus:ring-1 focus:ring-mainColor"
                            />
                    </div>
                </div>
                <div class="flex flex-col">
                    <p>Date</p>
                    <div class="flex flex-row gap-3">
                        <div class="relative w-[130px]">
                            <input 
                                type="text"
                                placeholder="Start"
                                class="w-[130px] h-[40px] border border-gray-300 px-4 pr-10 rounded-md focus:outline-none focus:ring-1 focus:ring-mainColor"
                            />
                            <IconCalender class="w-6 h-6"/>
                        </div>
                        <div class="relative w-[130px]">
                            <input 
                                type="text"
                                placeholder="End"
                                class="w-full h-[40px] border border-gray-300 px-4 pr-10 rounded-md focus:outline-none focus:ring-1 focus:ring-mainColor"
                            />
                            <IconCalender class="w-6 h-6"/>
                        </div>
                    </div>
                </div>
            </div>
            <button class="w-full mainBtn transition duration-300" type="submit">Proceed</button>
        </div>
    </div>
</template>