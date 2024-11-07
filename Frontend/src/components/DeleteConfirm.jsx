import PropTypes from 'prop-types';

const DeleteConfirm = ({ isOpen, onClose, onConfirm, message }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-96">
                <h2 className="text-lg font-semibold mb-4">Confirm Action</h2>
                <p className="mb-6">{message}</p>
                <div className="flex justify-between">
                    <button 
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600" 
                        onClick={onConfirm}>
                        Yes, delete
                    </button>
                    <button 
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400" 
                        onClick={onClose}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

DeleteConfirm.propTypes = {
    isOpen: PropTypes.bool.isRequired, // isOpen must be a boolean and is required
    onClose: PropTypes.func.isRequired, // onClose must be a function and is required
    onConfirm: PropTypes.func.isRequired, // onConfirm must be a function and is required
    message: PropTypes.string.isRequired, // message must be a string and is required
};

export default DeleteConfirm;
