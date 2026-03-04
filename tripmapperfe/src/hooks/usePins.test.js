import { renderHook, act } from '@testing-library/react';
import usePins from './usePins';
import pinService from '../services/pinService';
import showStatus from '../modules/showStatus';

jest.mock('../services/pinService', () => ({
  __esModule: true,
  default: {
    getAll: jest.fn(),
    getCount: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
}));
jest.mock('../modules/showError', () => jest.fn());
jest.mock('../modules/showStatus', () => jest.fn());

describe('usePins', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches pins and stores them in state', async () => {
    const pins = [
      { id: 1, title: 'Eiffel Tower' },
      { id: 2, title: 'Brandenburg Gate' },
    ];
    pinService.getAll.mockResolvedValue(pins);

    const { result } = renderHook(() => usePins());

    await act(async () => {
      await result.current.fetchPins('gate', null, null, 'history', 1, 10);
    });

    expect(pinService.getAll).toHaveBeenCalledWith('gate', null, null, 'history', 1, 10);
    expect(result.current.pins).toEqual(pins);
    expect(result.current.loading).toBe(false);
  });

  it('creates a pin, appends to state and shows status', async () => {
    const newPin = { id: 3, title: 'Colosseum' };
    pinService.create.mockResolvedValue(newPin);

    const { result } = renderHook(() => usePins());
    let created;

    await act(async () => {
      created = await result.current.createPin({ title: 'Colosseum' });
    });

    expect(created).toEqual(newPin);
    expect(result.current.pins).toEqual([newPin]);
    expect(showStatus).toHaveBeenCalledWith('Pin created successfully');
  });

  it('deletes a pin from state and shows status', async () => {
    const initialPins = [
      { id: 1, title: 'Eiffel Tower' },
      { id: 2, title: 'Brandenburg Gate' },
    ];
    pinService.getAll.mockResolvedValue(initialPins);
    pinService.delete.mockResolvedValue({});

    const { result } = renderHook(() => usePins());

    await act(async () => {
      await result.current.fetchPins();
    });

    await act(async () => {
      await result.current.deletePin(1);
    });

    expect(pinService.delete).toHaveBeenCalledWith(1);
    expect(result.current.pins).toEqual([{ id: 2, title: 'Brandenburg Gate' }]);
    expect(showStatus).toHaveBeenCalledWith('Pin deleted successfully');
  });

  it('returns null and sets error when pin details fetch fails', async () => {
    pinService.getById.mockRejectedValue({
      response: { data: { message: 'Pin not found' } },
    });

    const { result } = renderHook(() => usePins());
    let details;

    await act(async () => {
      details = await result.current.fetchPinDetails(404);
    });

    expect(details).toBeNull();
    expect(result.current.pinDetails).toBeNull();
    expect(result.current.error).toBe('Pin not found');
    expect(result.current.loading).toBe(false);
  });

  it('updates pinsCount from count endpoint', async () => {
    pinService.getCount.mockResolvedValue({ count: 42 });

    const { result } = renderHook(() => usePins());

    await act(async () => {
      await result.current.fetchPinsCount('museum', null, null, 'art');
    });

    expect(pinService.getCount).toHaveBeenCalledWith('museum', null, null, 'art');
    expect(result.current.pinsCount).toBe(42);
  });
});
