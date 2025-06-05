import AddService from "@/features/prices/pages/AddService.mdl.vue";
import Price from "@/features/prices/pages/Price.vue";
import ProvideServices from "@/features/prices/pages/ProvideServices.vue";
import ServiceManagement from "@/features/prices/pages/ServiceManagement.mdl.vue";
import Setting from "@/features/setting/pages/Setting.vue";

export default[
    // {
    //     path:'/service-management',
    //     name:'Service  Management',
    //     component:ServiceManagement
    // },
    // {
    //     path:'/add-service',
    //     name:'Add Service',
    //     component:AddService
    // },
    {
        path: "/services",
        name: "Services",
        component:Price,
      },
    {
        path:'/setting',
        name:'Settings',
        component:Setting

    },
    {
        path:'/provide_Services',
        name:'Provide Service',
        component:ProvideServices

    }
]