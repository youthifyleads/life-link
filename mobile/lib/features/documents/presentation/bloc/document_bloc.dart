import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';

import '../../domain/models/document_model.dart';
import '../../data/document_remote_datasource.dart';

// ── Events ────────────────────────────────────────────────
abstract class DocumentEvent extends Equatable {
  @override
  List<Object?> get props => [];
}

class LoadDocumentsEvent extends DocumentEvent {
  final String requestId;
  LoadDocumentsEvent(this.requestId);
  @override
  List<Object?> get props => [requestId];
}

class UploadDocumentEvent extends DocumentEvent {
  final String requestId;
  final String filePath;
  final String fileName;

  UploadDocumentEvent(this.requestId, this.filePath, this.fileName);
  @override
  List<Object?> get props => [requestId, filePath, fileName];
}

// ── States ────────────────────────────────────────────────
abstract class DocumentState extends Equatable {
  @override
  List<Object?> get props => [];
}

class DocumentInitial extends DocumentState {}

class DocumentLoading extends DocumentState {}

class DocumentLoaded extends DocumentState {
  final List<DocumentPublic> documents;
  DocumentLoaded(this.documents);
  @override
  List<Object?> get props => [documents];
}

class DocumentUploading extends DocumentState {
  final List<DocumentPublic>
      existingDocuments; // keep list visible while uploading
  DocumentUploading(this.existingDocuments);
  @override
  List<Object?> get props => [existingDocuments];
}

class DocumentUploadSuccess extends DocumentState {
  final DocumentPublic newDocument;
  DocumentUploadSuccess(this.newDocument);
  @override
  List<Object?> get props => [newDocument];
}

class DocumentError extends DocumentState {
  final String message;
  DocumentError(this.message);
  @override
  List<Object?> get props => [message];
}

// ── BLoC ──────────────────────────────────────────────────
class DocumentBloc extends Bloc<DocumentEvent, DocumentState> {
  final DocumentRemoteDataSource _dataSource;
  List<DocumentPublic> _currentDocuments = [];

  DocumentBloc(this._dataSource) : super(DocumentInitial()) {
    on<LoadDocumentsEvent>(_onLoadDocuments);
    on<UploadDocumentEvent>(_onUploadDocument);
  }

  Future<void> _onLoadDocuments(
    LoadDocumentsEvent event,
    Emitter<DocumentState> emit,
  ) async {
    emit(DocumentLoading());
    try {
      _currentDocuments = await _dataSource.getDocuments(event.requestId);
      emit(DocumentLoaded(_currentDocuments));
    } catch (e) {
      emit(DocumentError(e.toString()));
    }
  }

  Future<void> _onUploadDocument(
    UploadDocumentEvent event,
    Emitter<DocumentState> emit,
  ) async {
    emit(DocumentUploading(_currentDocuments));
    try {
      final newDoc = await _dataSource.uploadDocument(
        event.requestId,
        event.filePath,
        event.fileName,
      );

      // Successfully uploaded
      emit(DocumentUploadSuccess(newDoc));

      // Automatically refresh the list in state
      _currentDocuments = List.from(_currentDocuments)..add(newDoc);
      emit(DocumentLoaded(_currentDocuments));
    } catch (e) {
      emit(DocumentError(e.toString()));
      emit(DocumentLoaded(_currentDocuments)); // restore list
    }
  }
}
