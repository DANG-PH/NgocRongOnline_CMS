import axios from 'axios';
import { api, API_BASE_URL } from '../../api/client'; // Đảm bảo đường dẫn đúng tới file client.ts của bạn

// 1. Mock toàn bộ thư viện axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('API Client Wrapper', () => {
    // Reset mock sau mỗi test để đảm bảo sạch sẽ
    afterEach(() => {
        jest.clearAllMocks();
    });

    const endpoint = '/test-endpoint';
    const fullUrl = `${API_BASE_URL}${endpoint}`;
    const defaultHeaders = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    };

    // --- TEST GET METHOD ---
    describe('GET', () => {
        it('should call axios.get with correct URL and default headers', async () => {
            // Arrange
            const mockResponse = { data: 'success' };
            mockedAxios.get.mockResolvedValue(mockResponse);

            // Act
            const result = await api.get(endpoint);

            // Assert
            expect(mockedAxios.get).toHaveBeenCalledWith(fullUrl, expect.objectContaining({
                headers: expect.objectContaining(defaultHeaders)
            }));
            expect(result).toEqual(mockResponse);
        });

        it('should pass custom config (e.g., params)', async () => {
            mockedAxios.get.mockResolvedValue({});
            const config = { params: { id: 1 } };

            await api.get(endpoint, config);

            expect(mockedAxios.get).toHaveBeenCalledWith(fullUrl, expect.objectContaining({
                params: { id: 1 }
            }));
        });
    });

    // --- TEST POST METHOD ---
    describe('POST', () => {
        it('should call axios.post with data', async () => {
            const postData = { name: 'Test' };
            mockedAxios.post.mockResolvedValue({ data: 'created' });

            await api.post(endpoint, postData);

            expect(mockedAxios.post).toHaveBeenCalledWith(
                fullUrl,
                postData,
                expect.objectContaining({ headers: expect.objectContaining(defaultHeaders) })
            );
        });
    });

    // --- TEST PUT METHOD ---
    describe('PUT', () => {
        it('should call axios.put with data', async () => {
            const putData = { name: 'Updated' };
            mockedAxios.put.mockResolvedValue({ data: 'updated' });

            await api.put(endpoint, putData);

            expect(mockedAxios.put).toHaveBeenCalledWith(
                fullUrl,
                putData,
                expect.objectContaining({ headers: expect.objectContaining(defaultHeaders) })
            );
        });
    });

    // --- TEST PATCH METHOD ---
    describe('PATCH', () => {
        it('should call axios.patch with data and merged headers', async () => {
            const patchData = { status: 'active' };
            mockedAxios.patch.mockResolvedValue({ data: 'patched' });

            // Test việc merge thêm header Authorization
            const config = { headers: { Authorization: 'Bearer token' } };

            await api.patch(endpoint, patchData, config);

            expect(mockedAxios.patch).toHaveBeenCalledWith(
                fullUrl,
                patchData,
                expect.objectContaining({
                    headers: expect.objectContaining({
                        ...defaultHeaders,
                        Authorization: 'Bearer token' // Header mới được merge vào
                    })
                })
            );
        });
    });

    // --- TEST DELETE METHOD ---
    describe('DELETE', () => {
        it('should call axios.delete', async () => {
            mockedAxios.delete.mockResolvedValue({ data: 'deleted' });

            await api.delete(endpoint);

            expect(mockedAxios.delete).toHaveBeenCalledWith(
                fullUrl,
                expect.objectContaining({ headers: expect.objectContaining(defaultHeaders) })
            );
        });
    });

    // --- TEST ERROR HANDLING ---
    it('should propagate errors from axios', async () => {
        const error = new Error('Network Error');
        mockedAxios.get.mockRejectedValue(error);

        await expect(api.get(endpoint)).rejects.toThrow('Network Error');
    });
});