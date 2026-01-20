import wave
import math
import struct
import random

def save_wav(filename, data, sample_rate=44100):
    """Helper to save raw audio data to a WAV file."""
    # Ensure data is within 16-bit range
    packed_data = b''
    for sample in data:
        # Clip to 16-bit signed integer range
        s = max(-32767, min(32767, int(sample)))
        packed_data += struct.pack('<h', s)
        
    with wave.open(filename, 'w') as f:
        f.setnchannels(1)  # Mono
        f.setsampwidth(2)  # 2 bytes (16-bit)
        f.setframerate(sample_rate)
        f.writeframes(packed_data)
    print(f"Generated: {filename}")

def generate_square_wave(freq, duration, sample_rate=44100, volume=10000):
    """Generates a retro square wave (Gameboy style)."""
    n_samples = int(sample_rate * duration)
    data = []
    for i in range(n_samples):
        # Square wave math: positive if sin > 0, else negative
        t = float(i) / sample_rate
        value = volume if math.sin(2 * math.pi * freq * t) > 0 else -volume
        data.append(value)
    return data

def generate_slide_square(start_freq, end_freq, duration, sample_rate=44100, volume=10000):
    """Generates a square wave that slides pitch (good for 'thuds')."""
    n_samples = int(sample_rate * duration)
    data = []
    for i in range(n_samples):
        # Linear interpolation of frequency
        progress = i / n_samples
        current_freq = start_freq + (end_freq - start_freq) * progress
        
        t = float(i) / sample_rate
        # We integrate freq to keep phase continuous (simplified here)
        phase = 2 * math.pi * current_freq * t
        
        # Add a little 'noise' for crunchiness (simulating lo-fi)
        noise = random.randint(-1000, 1000)
        
        value = (volume if math.sin(phase) > 0 else -volume) + noise
        data.append(value)
    return data

def generate_arpeggio(notes, duration_per_note, sample_rate=44100):
    """Generates a sequence of notes."""
    data = []
    for freq in notes:
        data.extend(generate_square_wave(freq, duration_per_note, sample_rate))
    return data

# --- SOUND 1: The "Tetris Line Clear" (Replacement for Lock) ---
# A classic bright sound (Arcade style). High pitch arpeggio.
# Frequencies roughly: A5, C#6, E6, A6 (Major Chord)
lock_sound = generate_arpeggio([880, 1109, 1318, 1760], 0.05)

# --- SOUND 2: The "Sprint Success" (Line Clear) ---
# A quick major triad arpeggio (C - E - G - C)
# Frequencies: C5(523), E5(659), G5(783), C6(1046)
success_sound = generate_arpeggio([523, 659, 783, 1046], 0.08)

# --- SOUND 3: The "Capacity Warning" (Buzzer) ---
# A dissonant, low frequency square wave.
warning_sound = generate_square_wave(110, 0.3) # Low A

# Save files
save_wav('tetris_lock.wav', lock_sound)
save_wav('sprint_success.wav', success_sound)
save_wav('capacity_warning.wav', warning_sound)
