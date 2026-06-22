/**
 * @jest-environment jsdom
 */

// Mock global fetch
global.fetch = jest.fn();

// Tải file api.js vào môi trường JSDOM
require('../../public/js/api.js');

describe('MiniMart Frontend API', () => {
    
    beforeEach(() => {
        fetch.mockClear();
    });

    it('should fetch products successfully', async () => {
        // Arrange: Giả lập dữ liệu trả về từ Backend
        const mockProducts = {
            success: true,
            data: [
                { id: 1, name: 'Coca Cola', price: 10000 }
            ]
        };
        fetch.mockResolvedValueOnce({
            json: async () => mockProducts
        });

        // Act: Gọi hàm frontend
        const result = await window.MiniMart.API.getProducts();

        // Assert: Kiểm tra xem fetch có được gọi đúng URL không và kết quả trả về có chuẩn không
        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith('/api/public/products');
        expect(result).toEqual(mockProducts);
        expect(result.data[0].name).toBe('Coca Cola');
    });

    it('should place order and return order ID', async () => {
        // Arrange
        const mockResponse = {
            success: true,
            message: 'Đặt hàng thành công',
            order_id: 'INV-0015'
        };
        fetch.mockResolvedValueOnce({
            json: async () => mockResponse
        });

        const payload = {
            items: [{ productId: 1, quantity: 2, price: 10000 }],
            subtotal: 20000,
            discount: 0,
            total: 20000,
            paymentMethod: 'cash',
            customerName: 'Nguyễn Văn Test',
            shippingPhone: '0987654321',
            shippingAddress: ''
        };

        // Act
        const result = await window.MiniMart.API.placeOrder(payload);

        // Assert
        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith('/api/public/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        expect(result.order_id).toBe('INV-0015');
    });
});
