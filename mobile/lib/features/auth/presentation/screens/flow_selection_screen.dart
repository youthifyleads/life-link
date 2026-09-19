import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../bloc/auth_bloc.dart';

class FlowSelectionScreen extends StatelessWidget {
  const FlowSelectionScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Choose your LifeLink flow')),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text('Choose how you want to use the app.'),
            const SizedBox(height: 24),
            _FlowButton(
              icon: Icons.volunteer_activism_outlined,
              label: 'Donor',
              onPressed: () =>
                  context.read<AuthBloc>().add(AuthSelectFlowEvent('donor')),
            ),
            const SizedBox(height: 12),
            _FlowButton(
              icon: Icons.family_restroom_outlined,
              label: 'Caregiver',
              onPressed: () => context
                  .read<AuthBloc>()
                  .add(AuthSelectFlowEvent('caregiver')),
            ),
          ],
        ),
      ),
    );
  }
}

class _FlowButton extends StatelessWidget {
  const _FlowButton({
    required this.icon,
    required this.label,
    required this.onPressed,
  });

  final IconData icon;
  final String label;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton.icon(
        onPressed: onPressed,
        icon: Icon(icon),
        label: Text(label),
      ),
    );
  }
}
