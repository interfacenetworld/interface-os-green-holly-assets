# 03 — Avatar Animation and Personality

## Avatar asset
Preferred: GLB/GLTF, humanoid skeleton, facial morph targets/blendshapes, named animation clips.

Useful facial targets include jawOpen, mouthSmile, mouthFrown, mouthPucker, mouthFunnel, mouthClose, eyeBlinkLeft/right, gaze directions, brow controls. Preserve ARKit-compatible names when available and use a mapping layer.

## State behavior
- **idle:** 4-second breathing loop, natural blinking, tiny head/posture variation.
- **listening:** gaze engaged, reduced idle motion, subtle nods, clear microphone-active visual state.
- **understanding/thinking:** restrained eye/head changes, no exaggerated stereotype animation.
- **speaking:** viseme-driven mouth, blink/gaze continue, subtle head motion at phrase boundaries, bounded gestures.
- **minimized:** transition to Speaking Light/orb while preserving conversation.

## Gesture vocabulary
Do not let an LLM generate arbitrary bone transforms. The model may select only from a bounded set such as: `neutral`, `explain`, `point_left`, `point_right`, `emphasize`, `welcome`, `agree`, `uncertain`, `celebrate_small`.

## Personality
Target presentation: quirky/corky, dorky, cool, fun, chill, relaxed, technically/scientifically smart, socially fluent, compassionate, helpful, comfortable with formal English and informal/urban speech.

Personality changes presentation, not factual integrity.

Use expression labels such as `neutral`, `warm`, `curious`, `focused`, `amused`, `concerned`, `excited_small`, with a bounded intensity value.
