import React, { useEffect, useRef } from "react"

declare global {
  interface Window {
    ShopifyBuy?: any
  }
}

const ShopifyBuyButton = () => {
  const productRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const scriptURL = 'https://sdks.shopifycdn.com/buy-button/latest/buy-button-storefront.min.js'
    
    function loadScript() {
      const script = document.createElement('script')
      script.async = true
      script.src = scriptURL
      ;(document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(script)
      script.onload = ShopifyBuyInit
    }

    function ShopifyBuyInit() {
      const client = window.ShopifyBuy.buildClient({
        domain: 'ahiau0-xe.myshopify.com',
        storefrontAccessToken: 'da81211763a054900c05deffbfac807c',
      })
      
      window.ShopifyBuy.UI.onReady(client).then(function (ui: any) {
        ui.createComponent('product', {
          id: '8898846818358',
          node: productRef.current,
          moneyFormat: '%24%7B%7Bamount%7D%7D',
          options: {
            "product": {
              "styles": {
                "product": {
                  "@media (min-width: 601px)": {
                    "max-width": "calc(25% - 20px)",
                    "margin-left": "20px",
                    "margin-bottom": "50px"
                  }
                },
                "button": {
                  ":hover": {
                    "background-color": "#205959"
                  },
                  "background-color": "#236363",
                  ":focus": {
                    "background-color": "#205959"
                  }
                }
              },
              "text": {
                "button": "Add to cart"
              }
            },
            "productSet": {
              "styles": {
                "products": {
                  "@media (min-width: 601px)": {
                    "margin-left": "-20px"
                  }
                }
              }
            },
            "modalProduct": {
              "contents": {
                "img": false,
                "imgWithCarousel": true,
                "button": false,
                "buttonWithQuantity": true
              },
              "styles": {
                "product": {
                  "@media (min-width: 601px)": {
                    "max-width": "100%",
                    "margin-left": "0px",
                    "margin-bottom": "0px"
                  }
                },
                "button": {
                  ":hover": {
                    "background-color": "#205959"
                  },
                  "background-color": "#236363",
                  ":focus": {
                    "background-color": "#205959"
                  }
                }
              },
              "text": {
                "button": "Add to cart"
              }
            },
            "option": {},
            "cart": {
              "styles": {
                "button": {
                  ":hover": {
                    "background-color": "#205959"
                  },
                  "background-color": "#236363",
                  ":focus": {
                    "background-color": "#205959"
                  }
                }
              },
              "text": {
                "total": "Subtotal",
                "button": "Checkout"
              }
            },
            "toggle": {
              "styles": {
                "toggle": {
                  "background-color": "#236363",
                  ":hover": {
                    "background-color": "#205959"
                  },
                  ":focus": {
                    "background-color": "#205959"
                  }
                }
              }
            }
          },
        })
      })
    }

    if (window.ShopifyBuy) {
      if (window.ShopifyBuy.UI) {
        ShopifyBuyInit()
      } else {
        loadScript()
      }
    } else {
      loadScript()
    }
  }, [])

  return <div ref={productRef} id='product-component-1782588569993'></div>
}

export default ShopifyBuyButton
