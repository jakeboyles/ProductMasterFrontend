import React from 'react';
import './App.css';

class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
          categories: [],
          brands: [],
          products: [],
          categoriesLoading: true,
          brandsLoading: '',
          productsLoading: '',
          selectedCategory: {},
          activeCategory: '',
          activeBrand: '',
          showPopover: false
        }
    }

    async componentDidMount() {
      fetch("/categories")
      .then(response => response.text())
      .then((result)=>{
        const data = JSON.parse(result);
        this.setState({
          categories: data.reportdata,
          originalCategories: data.reportdata,
          categoriesLoading: false,
        })
      })
      .catch(error => console.log('error', error));
    }


    async getBrands(categories) {
      this.setState({
        brandsLoading: true,
        products: [],
        activeCategory: categories.cat3
      })
      fetch(`/brand/${categories.cat3}`)
      .then(response => response.text())
      .then((result)=>{
        const data = JSON.parse(result);
        this.setState({
          brands: data.reportdata,
          originalBrands: data.reportdata,
          brandsLoading: false
        })

      })
      .catch(error => console.log('error', error));
    }

    async getProducts(brand) {
      this.setState({
        productsLoading: true,
        activeBrand: brand
      })

      fetch(`/products/${brand}`)
      .then(response => response.text())
      .then((result)=>{
        const data = JSON.parse(result);
        this.setState({
          products: data.reportdata,
          productsLoading: false
        })

      })
      .catch(error => console.log('error', error));
    }

    async searchCategory(e) {
      const value = e.target.value.toLowerCase();

      if(value==='' || !value) {
        this.setState({
          categories: this.state.originalCategories
        })
      } else {
        const items = this.state.originalCategories.filter((item)=>{
          const val = item.Atrributes['Product Master Category Level 3_DESC'].toLowerCase();

          if(val.includes(value)) return true;

          return false;
        })

        this.setState({
          categories: items
        })
      }
    }

    async getProduct(brand, description) {
      fetch(`/product/${brand}/${description}`)
      .then(response => response.text())
      .then((result)=>{
        if(!result || result.length === 0) return false;
        const data = JSON.parse(result);
        this.setState({
          productInfo: data[0],
          showPopover: true
        })
      })
      .catch((error)=>{
      })
    }

    async searchBrand(e) {
      const value = e.target.value.toLowerCase();

      if(value==='' || !value) {
        this.setState({
          brands: this.state.originalBrands
        })
      } else {
        const items = this.state.originalBrands.filter((item)=>{
          const val = item.Atrributes['Product Brand_DESC'].toLowerCase();

          if(val.includes(value)) return true;

          return false;
        })

        this.setState({
          brands: items
        })
      }
    }

    render() {     

      const highlighted = {color:'#4FAE8A', fontWeight:'bold'};

      const showBrands = ()=>{
        if(!this.state.brandsLoading) { 
          return this.state.brands.map((value, index) => {
            let style = {}
            if(this.state.activeBrand === value.Atrributes['Product Brand_ID']) {
              style = highlighted
            }
            return <p style={style} onClick={this.getProducts.bind(this, value.Atrributes['Product Brand_ID'])}>{value.Atrributes['Product Brand_DESC']}</p>
          })
        } else {
          return <p>Loading...</p>
        }
      }

      const showProducts = ()=>{
        if(!this.state.productsLoading) { 
          return this.state.products.map((value, index) => {
            return <p>{value.Atrributes['Product_DESC']}</p>
          })
        } else {
          return <p>Loading...</p>
        }
      }

      const showPopover = ()=>{
        if(this.state.showPopover && this.state.productInfo) return <div className='popover'>
          {this.state.productInfo.description}
          <img src={this.state.productInfo.images[0].sizes[0].url} />
        </div>
      }
      
      const showCategories = ()=>{
        if(!this.state.categoriesLoading && this.state.categories && this.state.categories.length > 0) { 
          return this.state.categories.map((value, index) => {

            let style = {}
            if(this.state.activeCategory === value.Atrributes['Product Master Category Level 3_ID']) {
              style = highlighted
            }

            const categories = {
              cat0: value.Atrributes['Product Master Category Level 0_ID'],
              cat1: value.Atrributes['Product Master Category Level 1_ID'],
              cat2: value.Atrributes['Product Master Category Level 2_ID'],
              cat3: value.Atrributes['Product Master Category Level 3_ID'],
            }
            return <p style={style} onClick={this.getBrands.bind(this, categories)}>{value.Atrributes['Product Master Category Level 3_DESC']}</p>
          })
        } else {
          return <p>Loading...</p>
        }
      } 

        return (
            <div className="container">
              {showPopover()}
                <div className="categories col">
                  <h2>Categories</h2>
                  <input placeholder="Search..." type="text" value={this.state.cateogorySearch} onChange={this.searchCategory.bind(this)} />
                  <div className="content">
                    {showCategories()}
                  </div>
                </div>

                <div className="brands col">
                  <h2>Brands</h2>
                  {this.state.brands.length ?  <input placeholder="Search..."  type="text" value={this.state.brandSearch} onChange={this.searchBrand.bind(this)} /> : ''}
                  <div className="content">
                    {showBrands()}
                  </div>
                </div>

                <div className="brands col">
                  <h2>Products</h2>
                  <div className="content">
                    {showProducts()}
                  </div>
                </div>
            </div>
        )
    }
}

export default App;
