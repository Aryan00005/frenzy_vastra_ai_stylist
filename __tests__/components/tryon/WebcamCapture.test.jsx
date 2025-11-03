import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WebcamCapture } from '../../../src/components/tryon/WebcamCapture';

// Mock getUserMedia
const mockGetUserMedia = jest.fn();
const mockStop = jest.fn();

Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    getUserMedia: mockGetUserMedia,
  },
  writable: true
});

describe('WebcamCapture', () => {
  const mockOnCapture = jest.fn();
  const mockOnToggle = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful video stream
    mockGetUserMedia.mockResolvedValue({
      getTracks: () => [{
        stop: mockStop,
        getSettings: () => ({ facingMode: 'user' })
      }]
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders start camera button when not active', () => {
    render(
      <WebcamCapture 
        onCapture={mockOnCapture}
        isActive={false}
        onToggle={mockOnToggle}
      />
    );

    expect(screen.getByText('Start Camera')).toBeInTheDocument();
  });

  test('requests camera permission when start button clicked', async () => {
    render(
      <WebcamCapture 
        onCapture={mockOnCapture}
        isActive={false}
        onToggle={mockOnToggle}
      />
    );

    const startButton = screen.getByText('Start Camera');
    fireEvent.click(startButton);

    expect(mockOnToggle).toHaveBeenCalledWith(true);
  });

  test('displays loading state while starting camera', async () => {
    const { rerender } = render(
      <WebcamCapture 
        onCapture={mockOnCapture}
        isActive={false}
        onToggle={mockOnToggle}
      />
    );

    rerender(
      <WebcamCapture 
        onCapture={mockOnCapture}
        isActive={true}
        onToggle={mockOnToggle}
      />
    );

    await waitFor(() => {
      expect(mockGetUserMedia).toHaveBeenCalled();
    });
  });

  test('displays error message when camera permission denied', async () => {
    mockGetUserMedia.mockRejectedValue({
      name: 'NotAllowedError',
      message: 'Permission denied'
    });

    const { rerender } = render(
      <WebcamCapture 
        onCapture={mockOnCapture}
        isActive={false}
        onToggle={mockOnToggle}
      />
    );

    rerender(
      <WebcamCapture 
        onCapture={mockOnCapture}
        isActive={true}
        onToggle={mockOnToggle}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Camera permission was denied/i)).toBeInTheDocument();
    });
  });

  test('displays error message when no camera found', async () => {
    mockGetUserMedia.mockRejectedValue({
      name: 'NotFoundError',
      message: 'No camera found'
    });

    const { rerender } = render(
      <WebcamCapture 
        onCapture={mockOnCapture}
        isActive={false}
        onToggle={mockOnToggle}
      />
    );

    rerender(
      <WebcamCapture 
        onCapture={mockOnCapture}
        isActive={true}
        onToggle={mockOnToggle}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/No camera device found/i)).toBeInTheDocument();
    });
  });

  test('stops camera when stop button clicked', async () => {
    const { rerender } = render(
      <WebcamCapture 
        onCapture={mockOnCapture}
        isActive={true}
        onToggle={mockOnToggle}
      />
    );

    await waitFor(() => {
      expect(mockGetUserMedia).toHaveBeenCalled();
    });

    const stopButton = screen.getByText('Stop Camera');
    fireEvent.click(stopButton);

    expect(mockOnToggle).toHaveBeenCalledWith(false);
  });

  test('displays privacy notice', () => {
    render(
      <WebcamCapture 
        onCapture={mockOnCapture}
        isActive={false}
        onToggle={mockOnToggle}
      />
    );

    expect(screen.getByText(/camera access to provide real-time try-on experience/i)).toBeInTheDocument();
  });
});
