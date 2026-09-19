import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../bloc/tracking_bloc.dart';
import 'tracking_details_screen.dart';

class TrackingLookupScreen extends StatelessWidget {
  const TrackingLookupScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Tracking')),
      body: BlocBuilder<TrackingBloc, TrackingState>(
        builder: (context, state) {
          if (state is TrackingLoading || state is TrackingInitial) {
            return const Center(child: CircularProgressIndicator());
          }
          if (state is TrackingError) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Text(state.message, textAlign: TextAlign.center),
              ),
            );
          }
          if (state is TrackingLoaded) {
            return TrackingDetailsScreen(tracking: state.tracking);
          }
          return const SizedBox.shrink();
        },
      ),
    );
  }
}
