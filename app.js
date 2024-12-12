var app = new Vue({
    el: '#app',
    data: {
        sitename: "Activity Avenue",
        classes: [],  // Array to hold the fetched classes/products
        showProduct: true,  // Toggle between showing products or the cart
        cart: [],  // Array to hold cart items
        order: {
                firstName: '',
                lastName: '',
                address: '',
                city: '',
                zip: '',
                region: '',
                method: 'Home',
                gift: false
            },
            sortBy: 'location',  // Default sorting is by location
            sortOrder: 'asc',  // Default sorting order
            regions: {
                England: 'England',
                Scotland: 'Scotland',
                Wales: 'Wales',
                NorthernIreland: 'Northern Ireland'
    
        },
        sortBy: 'location',  // Default sorting is by location
        sortOrder: 'asc',  // Default sorting order
        searchQuery: ''  // Search query for filtering the classes
    },
    methods: {
        // Fetch classes from the backend using fetch API
        fetchClasses() {
            fetch('http://localhost:3001/products')  // Adjust your backend URL if necessary
                .then(response => response.json())   // Parse the JSON response
                .then(data => {
                    this.classes = data;  // Assign fetched data to the classes array
                })
                .catch(error => {
                    console.error('Error fetching classes:', error);
                });
        },
        addToCart(classItem) {
            this.cart.push(classItem.id);  // Add the class to the cart using its ID
        },
        removeFromCart(classItem) {
            const index = this.cart.indexOf(classItem.id);
            if (index !== -1) {
                this.cart.splice(index, 1);  // Remove the class from the cart by ID
            }
        },
        showCheckout() {
            this.showProduct = !this.showProduct;  // Toggle between product view and checkout
        },
        submitForm() {
            // Prepare the order data
            const orderData = {
                firstName: this.order.firstName,
                lastName: this.order.lastName,
                address: this.order.address,
                phone: this.order.phone,
                city: this.order.city,
                zip: this.order.zip,
                region: this.order.region,
                method: this.order.method,
                gift: this.order.gift,
                items: this.cart,  // Include the cart items in the order
            };
        
            // Send order data to the backend
            fetch('http://localhost:3001/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData),  // Convert order data to JSON
            })
                .then(response => response.json())  // Parse the JSON response from the backend
                .then(data => {
                    if (data.message) {
                        alert('Order Submitted! Order ID: ' + data.orderId);  // Alert user on successful order submission
                        this.cart = [];  // Clear the cart after submitting the order
                        this.showProduct = true;  // Optionally, show the product page again
                    }
                })
                .catch(error => {
                    console.error('Error submitting order:', error);
                    alert('There was an error submitting your order.');
                });
        
        },
        canAddToCart(classItem) {
            return classItem.availableSpots > this.cartCount(classItem.id);  // Check if spots are available
        },
        cartCount(id) {
            return this.cart.filter(item => item === id).length;  // Count the number of items in the cart by ID
        }
    },
    computed: {
        cartItemCount() {
            return this.cart.length || "";
        },
        cartClasses() {
            return this.classes.filter(classItem => this.cart.includes(classItem.id));
        },
        cartCounts() {
            return this.cart.reduce((acc, id) => {
                acc[id] = (acc[id] || 0) + 1;
                return acc;
            }, {});
        },
        sortedClasses() {
            let classesArray = this.classes.slice(0);  // Create a copy of the classes array to sort
            const sortOrder = this.sortOrder === 'asc' ? 1 : -1;

            // Filter classes based on the search query
            if (this.searchQuery) {
                classesArray = classesArray.filter(classItem => {
                    const searchQueryLower = this.searchQuery.toLowerCase();
                    return classItem.title.toLowerCase().includes(searchQueryLower) ||
                        classItem.location.toLowerCase().includes(searchQueryLower) ||
                        classItem.price.toString().includes(searchQueryLower);
                });
            }

            // Sort based on the selected property
            classesArray.sort((a, b) => {
                let comparison = 0;

                if (this.sortBy === 'subject') {
                    comparison = a.subject.localeCompare(b.subject);
                } else if (this.sortBy === 'price') {
                    comparison = a.price - b.price;
                } else if (this.sortBy === 'location') {
                    comparison = a.location.localeCompare(b.location);
                } else if (this.sortBy === 'availableSpots') {
                    comparison = a.availableSpots - b.availableSpots;
                }

                return comparison * sortOrder;
            });

            return classesArray;
        }
    },
    created() {
        this.fetchClasses();  // Fetch classes when the Vue app is mounted
    }
});
