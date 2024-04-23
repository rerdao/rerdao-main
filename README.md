# sen-suite

## DaisyUI - Why?

- Javascript-less
- SSR/SSG friendly
- TailwindCSS compartible
- Self Optimized

## Z-Index Rules

Because DaisyUI mounts the component exactly where the code was placed, the component will follow that original order. Different from Antd Design, or Material UI, the high-order visible components will be mounted at the end of body and relax the rule of z-index. DaisyUI need to have a strict rules to effectively manage the visibility.

Plus, the TailwindCSS just supports upto z-index of 50 at default, then we follow that for consistency.

| Component            | Z-Index |
| -------------------- | ------- |
| Splash               | 9999    |
| Alert                | 9998    |
| Drawer               | 50      |
| Drawer-based Sidebar | 40      |
| Sticky Header        | 30      |
| Modal                | 20      |
| Tooltip              | 10      |
| Dropdown             | 10      |
| Popover/Popper       | 10      |
| Overlay              | inherit |
| Others               | unset   |

## Manual Deploy

[Deploy](https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/f62833e5-bbba-4f3d-ae33-a4464dafee18)
