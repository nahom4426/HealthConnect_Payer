import AddService from "@/features/service/pages/AddService.mdl.vue";
import service from "@/features/service/pages/sevice.vue";
import ProvideServices from "@/features/service/pages/ProvideServices.vue";
import ServiceManagement from "@/features/service/pages/ServiceManagement.mdl.vue";
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
        component:service,
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