<script setup>
import Table from '@/components/Table.vue';
import icons from '@/utils/icons';
import DoughnutChart from '../components/DoughnutChart.vue';
import BarChart from '../components/BarChart.vue';
import Button from '@/components/Button.vue';
</script>

<template>
    <div class=" h-full w-full">
        <div class="grid grid-cols-3 bg-primary text-white rounded-md w-[100%] max-w-[1600px] overflow-hidden h-[30%]">
            <div class="col-span-2 flex flex-col gap-3 justify-start mt-7 px-10">
                <div class="flex items-center gap-3">
                    <i v-html="icons.moh" />
                    <div>
                        <div class="flex gap-2">
                            <h1 class="text-white text-xl font-bold">ጤና </h1>
                            <h1 class="text-white text-3xl font-bold">ሚኒስቴር-ኢትዮጵያ</h1>
                        </div>
                        <p class="text-2xl font-bold text-white">MINISTRY OF HEALTH-ETHIOPIA</p>
                    </div>
                </div>
                <h1 class="text-3xl font-bold mb-2 mt-2">WELCOME TO THE NDHP!</h1>
                <p class="">
                    It ensures accessibility for healthcare providers across the nation,<br>
                    enabling seamless service delivery. The platform complies with Ethiopian <br>
                    health and financial regulations, ensuring legal and operational <br> alignment.
                </p>
            </div>
            <div class="col-span-1">
                <img src="/src/assets/loginlogo.jpg
                " class="w-full h-full object-cover"
                    alt="Doctor working on a laptop" />
            </div>
        </div>

        <div class="grid grid-cols-3 gap-8 mt-10 w-[100%] max-w-[1600px] justify-between">
            <div class="grid grid-cols-2 items-center rounded-2xl p-2 col-span-2 border-lg border  gap-2">
                <div>
                    <div class="flex items-center gap-2 pl-5">
                        <i v-html="icons.started" class="text-blue-500 text-lg"></i>
                        <p class="opacity-50 text-sm">Started</p>
                    </div>
                    <p class="text-xl font-semibold text-gray-900 mt-4 pl-10">Feb 1st<span class="opacity-80 text-lg">,
                            2025</span></p>
                </div>
                <div class="pr-20 border-l pl-6">
                    <div class="flex items-center gap-2">
                        <i v-html="icons.internet" class="text-blue-500 text-lg"></i>
                        <p class="opacity-50 text-sm">Started</p>
                    </div>
                    <p class="text-2xl font-semibold text-gray-900 mt-4 pl-6">ETB 258,764 <span
                            class="opacity-80 text-2xl">.25</span></p>
                </div>
            </div>

            <div class="col-span-1 rounded-2xl border py-5 px-6 bg-white flex items-center justify-between">
                <div>
                    <p class="text-sm opacity-50">Withdraw Method</p>
                    <div class="flex items-center gap-2">
                        <i v-html="icons.chapa" />
                        <div>
                            <p class="text-lg font-semibold">Chapa</p>
                            <p class="text-sm opacity-50">Mobile Money</p>
                        </div>
                    </div>
                </div>
                <div class="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    <i class="fas fa-check-circle"></i>
                    <span>Connected</span>
                </div>
            </div>
        </div>


        <div class="grid grid-cols-3 p-6 bg-white rounded-lg shadow-md">
            <!-- Left Section (Bar Chart + Transactions) -->
            <div class="col-span-2 gap-2 pr-6">

                <!-- Bar Chart -->
                <BarChart />
            </div>

            <!-- Right Section (Patients & Donut Chart) -->
            <div class="flex flex-col gap-3 border-l">
                <div class="flex justify-between items-center mb-4">
                    <div class=" pl-4 h-[48]">
                        <p class="text-gray-500 text-sm">Patients</p>
                        <p class="text-2xl font-semibold">2,931</p>
                    </div>
                    <Button class="bg-gray-200 text-primary">View Report</Button>
                </div>
                <div class="flex justify-center">
                    <DoughnutChart />
                </div>
            </div>
        </div>

    </div>
</template>
<style scoped>
/* .bg-gradient {
    background: linear-gradient(to right, #fbc2eb, #a18cd1);
} */
.action-icon {
    cursor: pointer;
    color: #007bff;
}
</style>