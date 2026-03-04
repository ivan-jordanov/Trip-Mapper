import { renderHook, act } from '@testing-library/react';
import useTrips from './useTrips';
import tripService from '../services/tripService';
import showStatus from '../modules/showStatus';

jest.mock('../services/tripService', () => ({
  __esModule: true,
  default: {
    getAll: jest.fn(),
    getCount: jest.fn(),
    getById: jest.fn(),
    getAccess: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));
jest.mock('../modules/showError', () => jest.fn());
jest.mock('../modules/showStatus', () => jest.fn());

describe('useTrips', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches trips and stores them in state', async () => {
    const trips = [
      { id: 1, title: 'Paris' },
      { id: 2, title: 'Berlin' },
    ];
    tripService.getAll.mockResolvedValue(trips);

    const { result } = renderHook(() => useTrips());

    await act(async () => {
      await result.current.fetchTrips('city', null, null, 1, 10);
    });

    expect(tripService.getAll).toHaveBeenCalledWith('city', null, null, 1, 10);
    expect(result.current.trips).toEqual(trips);
    expect(result.current.loading).toBe(false);
  });

  it('creates a trip, appends to state and shows status', async () => {
    const newTrip = { id: 3, title: 'Rome' };
    tripService.create.mockResolvedValue(newTrip);

    const { result } = renderHook(() => useTrips());
    let created;

    await act(async () => {
      created = await result.current.createTrip({ title: 'Rome' });
    });

    expect(created).toEqual(newTrip);
    expect(result.current.trips).toEqual([newTrip]);
    expect(showStatus).toHaveBeenCalledWith('Trip created successfully');
  });

  it('updates a trip in state and shows status', async () => {
    const initialTrips = [
      { id: 1, title: 'Paris' },
      { id: 2, title: 'Berlin' },
    ];
    const updatedTrip = { id: 2, title: 'Berlin Updated' };
    tripService.getAll.mockResolvedValue(initialTrips);
    tripService.update.mockResolvedValue(updatedTrip);

    const { result } = renderHook(() => useTrips());

    await act(async () => {
      await result.current.fetchTrips();
    });

    let response;
    await act(async () => {
      response = await result.current.updateTrip(2, { title: 'Berlin Updated' });
    });

    expect(response).toEqual(updatedTrip);
    expect(result.current.trips).toEqual([
      { id: 1, title: 'Paris' },
      { id: 2, title: 'Berlin Updated' },
    ]);
    expect(showStatus).toHaveBeenCalledWith('Trip updated successfully');
  });

  it('deletes a trip from state and shows status', async () => {
    const initialTrips = [
      { id: 1, title: 'Paris' },
      { id: 2, title: 'Berlin' },
    ];
    tripService.getAll.mockResolvedValue(initialTrips);
    tripService.delete.mockResolvedValue({});

    const { result } = renderHook(() => useTrips());

    await act(async () => {
      await result.current.fetchTrips();
    });

    await act(async () => {
      await result.current.deleteTrip(1, 'row-version-1');
    });

    expect(tripService.delete).toHaveBeenCalledWith(1, 'row-version-1');
    expect(result.current.trips).toEqual([{ id: 2, title: 'Berlin' }]);
    expect(showStatus).toHaveBeenCalledWith('Trip deleted successfully');
  });

  it('returns null and sets error when trip details fetch fails', async () => {
    tripService.getById.mockRejectedValue({
      response: { data: { message: 'Trip not found' } },
    });

    const { result } = renderHook(() => useTrips());
    let details;

    await act(async () => {
      details = await result.current.fetchTripDetails(999);
    });

    expect(details).toBeNull();
    expect(result.current.tripDetails).toBeNull();
    expect(result.current.error).toBe('Trip not found');
    expect(result.current.loading).toBe(false);
  });
});
