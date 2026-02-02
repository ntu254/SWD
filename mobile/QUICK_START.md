# 🚀 Quick Start Guide for Mobile Coder

## ⚡ Get Started in 5 Minutes

### 1. **Clone & Install**
```bash
cd mobile
npm install
```

### 2. **Start Development Server**
```bash
npm start
```

### 3. **Run on Emulator**
- Press `a` for Android
- Press `i` for iOS

---

## 📁 **Codebase Overview**

### **Where to Find Things:**

```
mobile/src/
│
├── 🎯 app/                      # Application core
│   ├── App.tsx                 # Root component
│   ├── navigation/             
│   │   └── RootNavigator.tsx   # 👈 Navigation setup (Stack + Tabs)
│   └── providers/
│       └── QueryProvider.tsx   # React Query setup
│
├── 🎨 features/                 # Feature modules (work here)
│   │
│   ├── auth/ ✅                 # DONE - Login & Register
│   │   ├── api/authApi.ts      # Auth API hooks
│   │   ├── model/authSchemas.ts# Form validation
│   │   └── ui/
│   │       ├── LoginScreen.tsx
│   │       └── RegisterScreen.tsx
│   │
│   ├── home/ 🚧                 # TODO - Dashboard
│   │   └── ui/                 # Create HomeScreen.tsx here
│   │
│   ├── map/ 🚧                  # PARTIAL - Has component, needs screen
│   │   ├── ui/
│   │   │   └── components/
│   │   │       └── GreenLoopMap.tsx  # Map component ready
│   │   └── model/useLocations.ts     # Mock data
│   │
│   └── profile/ 🚧              # TODO - User profile
│       └── ui/                 # Create ProfileScreen.tsx here
│
└── 🔧 shared/                   # Shared utilities
    ├── ui/                     # ✅ Reusable components
    │   ├── Button/
    │   ├── Input/
    │   └── Card/
    │
    ├── api/
    │   └── client.ts           # ✅ Axios with auth interceptors
    │
    ├── store/
    │   └── authStore.ts        # ✅ Zustand auth state
    │
    └── config/
        └── theme.ts            # ✅ Design tokens
```

---

## 🎯 **Your First Tasks**

### **Task 1: Create Home Screen** (Recommended start)

Create `src/features/home/ui/HomeScreen.tsx`:

```typescript
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../../../shared/config/theme';
import { Button } from '../../../shared/ui';

interface HomeScreenProps {
    navigation: any;
}

export function HomeScreen({ navigation }: HomeScreenProps) {
    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>GreenLoop Dashboard</Text>
                <Text style={styles.subtitle}>Chào mừng bạn trở lại!</Text>
            </View>

            {/* TODO: Add statistics cards */}
            {/* TODO: Add recent activities */}
            {/* TODO: Add quick actions */}

            <Button 
                variant="primary" 
                onPress={() => navigation.navigate('Map')}
            >
                Xem Bản Đồ
            </Button>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.gray[50],
    },
    header: {
        padding: 24,
        paddingTop: 60,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: colors.gray[900],
    },
    subtitle: {
        fontSize: 16,
        color: colors.gray[600],
        marginTop: 8,
    },
});
```

Then update `RootNavigator.tsx` line 24:
```typescript
import { HomeScreen } from '../../features/home/ui/HomeScreen';

// Replace placeholder:
const HomeScreen = () => ( ... ) // ❌ Remove this

// Already imported above ✅
```

---

## 🛠️ **Common Patterns**

### **1. Creating a New Screen**

```typescript
// Template: src/features/{feature}/ui/{Name}Screen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../../shared/config/theme';

interface {Name}ScreenProps {
    navigation: any;
}

export function {Name}Screen({ navigation }: {Name}ScreenProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Screen Title</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.gray[50],
        padding: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: colors.gray[900],
    },
});
```

### **2. Creating an API Hook**

```typescript
// Template: src/features/{feature}/api/{feature}Api.ts
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '../../../shared/api/client';

// Fetch data
export const useFetchData = () => {
    return useQuery({
        queryKey: ['data'],
        queryFn: async () => {
            const response = await apiClient.get('/api/endpoint');
            return response.data;
        },
    });
};

// Submit data
export const useSubmitData = () => {
    return useMutation({
        mutationFn: async (data: any) => {
            const response = await apiClient.post('/api/endpoint', data);
            return response.data;
        },
        onSuccess: () => {
            // Handle success
        },
    });
};
```

### **3. Using Form with Validation**

```typescript
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input, Button } from '../../../shared/ui';

const schema = z.object({
    field: z.string().min(1, 'Required'),
});

type FormData = z.infer<typeof schema>;

export function MyForm() {
    const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const onSubmit = (data: FormData) => {
        console.log(data);
    };

    return (
        <Controller
            control={control}
            name="field"
            render={({ field: { onChange, value } }) => (
                <Input
                    value={value}
                    onChangeText={onChange}
                    error={errors.field?.message}
                />
            )}
        />
    );
}
```

---

## 📖 **Available Components**

### **Button**
```typescript
import { Button } from '../../shared/ui';

<Button variant="primary" size="lg" loading={false}>
    Click Me
</Button>

// Variants: primary, secondary, ghost
// Sizes: sm, md, lg
```

### **Input**
```typescript
import { Input } from '../../shared/ui';
import { Mail } from 'lucide-react-native';

<Input
    label="Email"
    placeholder="you@example.com"
    icon={<Mail size={18} />}
    error="Error message"
/>
```

### **Card**
```typescript
import { Card } from '../../shared/ui';

<Card>
    <Text>Card content</Text>
</Card>
```

---

## 🎨 **Design Tokens**

```typescript
import { colors, spacing, borderRadius } from '../../shared/config/theme';

// Colors
colors.brand[600]    // #059669 (Primary green)
colors.accent[500]   // #f59e0b (Orange)
colors.gray[50]      // Background
colors.gray[900]     // Dark text

// Spacing
spacing.xs   // 4
spacing.sm   // 8
spacing.md   // 16
spacing.lg   // 24

// Border Radius
borderRadius.md   // 12
borderRadius.lg   // 16
```

---

## 🐛 **Debugging**

### **Clear Cache**
```bash
npm start -- --clear
```

### **View Errors**
- Shake device (Ctrl+M on Android, Cmd+D on iOS)
- Select "Show Dev Menu"
- "Toggle Inspector" or "Show Perf Monitor"

### **Type Check**
```bash
npx tsc --noEmit
```

---

## 📚 **Resources**

- **React Navigation Docs:** https://reactnavigation.org/
- **React Hook Form:** https://react-hook-form.com/
- **TanStack Query:** https://tanstack.com/query/latest
- **Zod:** https://zod.dev/
- **Lucide Icons:** https://lucide.dev/

---

## ✅ **Checklist Before Committing**

- [ ] TypeScript check passes (`npx tsc --noEmit`)
- [ ] No console errors in app
- [ ] Tested on Android emulator
- [ ] Code follows existing patterns
- [ ] No hardcoded values (use theme tokens)
- [ ] Proper error handling added

---

**Need Help?** Check CODE_REVIEW.md for detailed implementation guidelines.

**Happy Coding! 🚀**
